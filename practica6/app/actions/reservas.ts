"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validación de Zod corregida
const EsquemaReserva = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    correo: z.string().email("El correo no es válido."),
    fecha: z.string().min(1, "La fecha es obligatoria."),
    servicioId: z.coerce.number().min(1, "Debe seleccionar un servicio."),
});
export type EstadoFormulario = {
    errores?: {
        nombre?: string[];
        correo?: string[];
        fecha?: string[];
        servicioId?: string[];
    };
    mensaje?: string;
} | null | undefined;

export async function crearReserva(prevState: EstadoFormulario, formData: FormData) {
    const validacion = EsquemaReserva.safeParse({
        nombre: formData.get("nombre"),
        correo: formData.get("correo"),
        fecha: formData.get("fecha"),
        servicioId: formData.get("servicioId"),
    });

    if (!validacion.success) {
        return { errores: validacion.error.flatten().fieldErrors };
    }

    const data = validacion.data;
    const nuevaFechaInicio = new Date(data.fecha);

    try {
        // --- EJERCICIO 1: VALIDACIÓN DE DISPONIBILIDAD (Considerando duración) ---
        const servicio = await prisma.servicio.findUnique({
            where: { id: data.servicioId }
        });

        if (!servicio) {
            return { errores: { servicioId: ["El servicio no existe."] } };
        }

        // Calculamos a qué hora termina la nueva cita (duración en minutos * 60000 ms)
        const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + servicio.duracion * 60000);

        // Traemos las reservas activas
        const reservasActivas = await prisma.reserva.findMany({
            where: {
                servicioId: data.servicioId,
                estado: { not: "cancelada" }
            },
            include: { servicio: true }
        });

        // Verificamos si los tiempos chocan
        const hayConflicto = reservasActivas.some((reserva) => {
            const inicioExistente = new Date(reserva.fecha);
            const finExistente = new Date(inicioExistente.getTime() + reserva.servicio.duracion * 60000);

            return nuevaFechaInicio < finExistente && nuevaFechaFin > inicioExistente;
        });

        if (hayConflicto) {
            return { errores: { fecha: ["El horario choca con otra reserva."] } };
        }

        // --- CREACIÓN ---
        // Aquí usamos "nombre" y "correo" exactamente como están en tu schema.prisma
        await prisma.reserva.create({
            data: {
                nombre: data.nombre,
                correo: data.correo,
                fecha: nuevaFechaInicio,
                servicioId: data.servicioId,
                estado: "pendiente"
            },
        });
    } catch (error) {
        return { mensaje: "Error interno al crear la reserva." };
    }

    revalidatePath("/reservas");
    redirect("/reservas");
}

// --- EJERCICIO 2: CANCELAR (Soft Delete) ---
export async function cancelarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: { id },
            data: { estado: "cancelada" }
        });
        revalidatePath("/reservas");
        return { exito: true };
    } catch (error) {
        return { exito: false, mensaje: "No se pudo cancelar." };
    }
}

// --- EJERCICIO 4: CONFIRMAR ---
export async function confirmarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: { id },
            data: { estado: "confirmada" }
        });
        revalidatePath("/reservas");
        return { exito: true };
    } catch (error) {
        return { exito: false, mensaje: "No se pudo confirmar." };
    }
}