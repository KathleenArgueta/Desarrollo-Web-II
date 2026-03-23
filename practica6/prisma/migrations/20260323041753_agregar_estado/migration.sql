/*
  Warnings:

  - You are about to drop the column `correo` on the `Reserva` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Reserva` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Reserva` table. All the data in the column will be lost.
  - Added the required column `clienteEmail` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteNombre` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_servicioId_fkey";

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "correo",
DROP COLUMN "createdAt",
DROP COLUMN "nombre",
ADD COLUMN     "clienteEmail" TEXT NOT NULL,
ADD COLUMN     "clienteNombre" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
