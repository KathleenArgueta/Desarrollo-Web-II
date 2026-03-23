"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { crearReserva, type EstadoFormulario } from "../../actions/reservas";
import { input, label, botonPrimario } from "../../lib/estilos";
import type { Servicio } from "@prisma/client";

const estadoInicial: EstadoFormulario = { errores: {}, mensaje: "" };

function BotonSubmit() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className={botonPrimario}>
            {pending ? "Guardando..." : "Guardar Reserva"}
        </button>
    );
}

// Exportación nombrada (sin la palabra default)
export function FormularioReserva({ servicios }: { servicios: Servicio[] }) {
    // ¡Aquí está la variable accion que faltaba!
    const [estado, accion] = useActionState(crearReserva, estadoInicial);

    return (
        <form action={accion} className="space-y-4 max-w-md mt-6">
            <div>
                <label htmlFor="nombre" className={label}>Nombre del cliente</label>
                <input type="text" id="nombre" name="nombre" className={input} required />
                {estado?.errores?.nombre && (
                    <p className="text-red-500 text-xs mt-1">{estado.errores.nombre[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="correo" className={label}>Correo electrónico</label>
                <input type="email" id="correo" name="correo" className={input} required />
                {estado?.errores?.correo && (
                    <p className="text-red-500 text-xs mt-1">{estado.errores.correo[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="fecha" className={label}>Fecha y Hora</label>
                <input type="datetime-local" id="fecha" name="fecha" className={input} required />
                {estado?.errores?.fecha && (
                    <p className="text-red-500 text-xs mt-1">{estado.errores.fecha[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="servicioId" className={label}>Servicio</label>
                <select id="servicioId" name="servicioId" className={input} required>
                    <option value="">Seleccione un servicio...</option>
                    {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.nombre} ({s.duracion} min)
                        </option>
                    ))}
                </select>
                {estado?.errores?.servicioId && (
                    <p className="text-red-500 text-xs mt-1">{estado.errores.servicioId[0]}</p>
                )}
            </div>

            {estado?.mensaje && (
                <p className="text-red-500 text-sm font-semibold">{estado.mensaje}</p>
            )}

            <BotonSubmit />
        </form>
    );
}