"use client";

import { useTransition } from "react";
import { confirmarReserva } from "../actions/reservas";

export function BotonConfirmarReserva({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => confirmarReserva(id))}
            disabled={isPending}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
        >
            {isPending ? "Confirmando, espere porfi" : "Confirmar"}
        </button>
    );
}