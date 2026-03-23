"use client";

import { cancelarReserva, confirmarReserva } from "../actions/reservas";

export function BotonEliminarReserva({ id }: { id: number }) {
    return (
        <div className="flex gap-2">
            {/* Botón del Ejercicio 4: Confirmar */}
            <button
                onClick={async () => {
                    if (confirm("¿Estás seguro de confirmar esta reserva?")) {
                        await confirmarReserva(id);
                    }
                }}
                className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
                Confirmar
            </button>

            { }
            <button
                onClick={async () => {
                    if (confirm("¿Estás seguro de cancelar esta reserva?")) {
                        await cancelarReserva(id);
                    }
                }}
                className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
                Cancelar
            </button>
        </div>
    );
}