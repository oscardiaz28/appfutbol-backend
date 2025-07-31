import prisma from "../models/prisma";

export const createRol = async () => {

    const rolCount = await prisma.roles.count()

    if(rolCount == 0){
        await prisma.roles.createMany({
            data: [
                {nombre: "admin"},
                {nombre: "entrenador"},
                {nombre: "evaluador"},
            ]
        })
        console.log("Roles creados")
    }else{
        console.log("Roles is already created.")
    }
}
createRol()