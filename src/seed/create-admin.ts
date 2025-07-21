import { hashPassword } from "../lib/utils";
import prisma from "../models/prisma";

const createUser = async () => {

    const pass = await hashPassword("1234");
    await prisma.users.create({
        data: {
            username: "admin",
            email: "john@gmail.com",
            nombre: "John",
            apellido: "Doe",
            rol_id: 1,
            password: pass
        }
    })
    console.log("Usuario creado")
}
createUser()