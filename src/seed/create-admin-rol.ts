import prisma from "../models/prisma";

const createRol = async () => {
    await prisma.roles.create({
        data: {
            nombre: "admin"
        }
    })
    console.log("Rol admin creado")
}
createRol()