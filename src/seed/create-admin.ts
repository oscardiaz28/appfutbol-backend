import { hashPassword } from "../lib/utils";
import prisma from "../models/prisma";

export const createUser = async () => {

    const pass = await hashPassword(<string>process.env.INITIAL_PASS);
    const existing = await prisma.users.findUnique({ where: { email: "john@gmail.com" } })
    if (existing) {
        console.log("El usuario ya existe");
    } else {
        await prisma.users.create({
            data: {
                email: "john@gmail.com",
                nombre: "John",
                apellido: "Doe",
                rol_id: 1,
                fecha_registro: new Date(),
                password: pass
            }
        }
        )
        console.log("Usuario creado")
    }

}