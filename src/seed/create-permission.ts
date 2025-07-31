import prisma from "../models/prisma";

export const createPermissions = async () => {

    const permissionCount = await prisma.permission.count()

    if (permissionCount == 0) {
        const permissions = [
            { name: "gastos", description: "Permite manejar los gastos del jugador y ver historial" },
            { name: "mantener_jugadores", description: "Maneja jugadores" },
            { name: "top_jugadores", description: "Muestra top de jugadores" },
            { name: "config", description: "Acceso a configuraciones" },
            { name: "mantener_evaluacion", description: "Acceso a evaluaciones" },
            { name: "mantener_usuario", description: "Acceso a usuarios" },
            { name: "reportes", description: "Muestra reportes" },
            { name: "historial", description: "Muestra el historial" },
        ];
        await Promise.all(
            permissions.map(p =>
                prisma.permission.create({
                    data: {
                        name: p.name,
                        description: p.description,
                        roles: {
                            create: {
                                role: {
                                    connect: { id: 1 } 
                                }
                            }
                        }
                    }
                })
            )
        );
        console.log("Permisos creados")
    } else {
        console.log("Permissions is already created")
    }

}
createPermissions();