import {z} from 'zod'

export const loginRequestSchema = z.object({
    email: z.email("El email no tiene un formato valido")
    .trim(),
    password: z.string({message: "La contraseña es obligatoria"}).nonempty("La contraseña no puede estar vacia")
})

export const playerRequestSchema = z.object({
    nombre: z.string({message: "El nombre es obligatorio"})
            .trim()
            .nonempty("El nombre no puede estar vacio"),
    apellido: z.string({message: "El apellido es obligatorio"})
            .trim()
            .nonempty("El apellido no puede estar vacio"),
    fecha_nacimiento: z.string()
                    .nonempty("La fecha de registro no puede estar vacia")
                    .refine( val => val === undefined || !isNaN(Date.parse(val)), {
                        message: "La fecha de nacimiento no es válida"
                    }),
    fecha_registro: z.string({message: "La fecha de registro es obligatoria"})
                    .nonempty("La fecha de registro no puede estar vacia")
                    .refine( val => val === undefined || !isNaN(Date.parse(val)), {
                        message: "La fecha de registro no es válida"
                    }),
    identificacion: z.string({message: "La identificacion es obligatoria"})
                    .nonempty("La identificacion no puede estar vacia"),
    pais: z.string({message: "El pais no es valido"})
        .nonempty("El pais no puede estar vacio"),
    talla: z.string()
        .optional()
        .refine( val => val === undefined || !isNaN(Number(val)), {
             message: "La talla debe ser un número válido"
        }),
    peso: z.string()
        .optional()
        .refine( val => val === undefined || !isNaN(Number(val)), {
             message: "El peso debe ser un número válido"
        }),
    pie_habil: z.enum(["derecho", "izquierdo"], {
                    message: "El pie hábil debe ser 'derecho' o 'izquierdo'"
                }),
    posicion: z.enum(["delantero", "defensa", "portero", "mediocampista"], {
                    message: "La posición no es válida"
                })
})


export const updatePlayerSchema = z.object({
    nombre: z.string().optional(),
    apellido: z.string().optional(),
    fecha_nacimiento: z.string()
                    .optional()
                    .refine( val => val === undefined || !isNaN(Date.parse(val)), {
                        message: "La fecha de nacimiento no es válida"
                    }),
    fecha_registro: z.string({message: "La fecha de registro es obligatoria"})
                    .optional()
                    .refine( val => val === undefined || !isNaN(Date.parse(val)), {
                        message: "La fecha de registro no es válida"
                    }),
    identificacion: z.string().optional(),
    pais: z.string({message: "El pais no es valido"}).optional(),
    monto: z.string()
        .optional()
        .refine( val => val === undefined || !isNaN(Number(val)), {
            message: "El monto no es válido"
        }),
    talla: z.string()
        .optional()
        .refine( val => val === undefined || !isNaN(Number(val)), {
             message: "La talla debe ser un número válido"
        }),
    peso: z.string()
        .optional()
        .refine( val => val === undefined || !isNaN(Number(val)), {
             message: "El peso debe ser un número válido"
        }),
    pie_habil: z.enum(["derecho", "izquierdo"], {
                    message: "El pie hábil debe ser 'derecho' o 'izquierdo'"
                }).optional(),
    posicion: z.enum(["delantero", "defensa", "portero", "mediocampista"], {
                    message: "La posición no es válida"
                }).optional()
})


export const typeEvaluationRequestSchema = z.object({
    nombre: z.string({message: "El nombre es obligatorio"})
    .trim()
    .nonempty("El nombre no puede estar vacio")
    .transform(val => val.toLowerCase()),
    icono: z.string("Formato de icono no valido").optional()
})

export const ParameterRequestSchema = z.object({
    nombre: z.string({message: "El nombre es obligatorio"})
            .trim()
            .nonempty("El nombre no puede estar vacio")
            .transform(val => val.toLowerCase()),
    descripcion: z.string({message: "La descripción es obligatoria"})
            .trim()
            .nonempty("La descripción no puede estar vacia"),
    type_id: z.number("Formato no valido")
})


const parametroSchema = z.object({
    parametroId: z.number("Parametro no valido").int(),
    valor: z.number().min(0, {message: "La evaluacion es 0 como minimo"}).max(10, {message: "La evaluación es 10 como maximo"})
})

export const EvaluationRequestSchema = z.object({
    playerId: z.number("Formato no valido"),
    tipoId: z.number("Formato no valido"),
    parametros: z.array(parametroSchema, {message: "Agrega un parametro de evaluación como minimo"}).min(1, {message: "Debes enviar al menos un parametro de evaluación"})
})

export const UserRequestSchema = z.object({
    username: z.string({message: "El username es obligatorio"})
    .trim()
    .nonempty("El username no puede estar vacio"),
    email: z.email("Formato no valido para el email")
    .trim(),
    nombre: z.string("El nombre es obligatorio")
    .trim()
    .nonempty("El nombre no puede estar vacio"),
    apellido: z.string("El apellido es obligatorio")
    .trim()
    .nonempty("El apellido no puede estar vacio"),
    rol_id: z.number("id no valido"),
    password: z.string("La contraseña es obligatoria")
    .trim()
    .nonempty("La contraseña no puede estar vacia")
})


export const PermissionRequestSchema = z.object({
    name: z.string("El nombre es obligatorio")
    .trim()
    .nonempty("El nombre no puede estar vacio"),
    description: z.string("La descripción es obligatoria")
    .trim()
    .nonempty("La descripción no puede estar vacia")
})

export const UpdateTypeEvaluationSchema = z.object({
    nombre: z.string("Formato no valido")
    .trim()
    .toLowerCase()
    .nonempty("El campo no puede estar vacio")
    .optional(),
    icono: z.string("Formato no valido")
    .trim()
    .nonempty("El campo no puede estar vacio")
    .optional()
})

export const UpdateParameterSchema = z.object({
    nombre: z.string("El campo nombre no tiene un formato valido")
    .trim()
    .toLowerCase()
    .nonempty("El campo no puede estar vacio")
    .optional(),
    descripcion: z.string("El campo descripcion no tiene un formato valido")
    .trim()
    .toLowerCase()
    .nonempty("El campo no puede estar vacio")
    .optional(),
    type_id: z.number("Formato no valido para typeId")
    .optional()
})


export const AdminUpdateUserSchema = z.object({
    username: z.string("El campo username no tiene un formato válido")
    .trim()
    .optional(),
    email: z.email("El email no tiene un formato válido")
    .trim()
    .optional(),
    nombre: z.string("El campo nombre no tiene un formato válido")
    .trim()
    .optional(),
    apellido: z.string("El campo apellido no tiene un formato válido")
    .trim()
    .optional(),
    rol_id: z.number("Formato no válido para rol")
    .optional()
})

export const ProfileUpdateUserSchema = z.object({
    username: z.string("El campo username no tiene un formato válido")
    .trim()
    .optional(),
    nombre: z.string("El campo nombre no tiene un formato válido")
    .trim()
    .optional(),
    apellido: z.string("El campo apellido no tiene un formato válido")
    .trim()
    .optional()
})


export const GastoRequestSchema = z.object({
    player_id: z.number("Id no valido para player"),
    monto: z.string("Campo no valido para monto")
    .trim()
    .nonempty("El monto no puede estar vacio")
    .refine( val => val === undefined || !isNaN(parseInt(val)), {
        message: "Valor de monto no válido"
    }),
    descripcion: z.string("La descripcion es obligatoria")
    .trim()
    .nonempty("La descripcion no puede estar vacia"),
    fecha: z.string("La fecha no es válida")
    .refine( val => val === undefined || !isNaN(Date.parse(val)), {
        message: "La fecha no es válida"
    }),
})


export const EditGastoRequestSchema = z.object({
    monto: z.string("Valor no valido para el monto")
    .trim()
    .nonempty("El monto no puede estar vacio")
    .optional(),
    descripcion: z.string("Valor no valido para la descripcion")
    .trim()
    .nonempty("La descripción es obligatoria")
    .optional()
})

export const UpdatePermissionRequestSchema = z.object({
    name: z.string("El nombre es obligatorio")
    .trim()
    .nonempty("El nombre no puede estar vacio")
    .optional(),
    description: z.string("La descripción es obligatoria")
    .trim()
    .nonempty("La descripción no puede estar vacia")
    .optional()
})


export const ChangePasswordRequestSchema = z.object({
    current_password: z.string("La contraseña actual es obligatoria")
    .trim()
    .nonempty("El campo no puede estar vacio"),
    new_password: z.string("La nueva contraseña es obligatoria")
    .trim()
    .nonempty("El campo no puede estar vacio"),
    repeat_new_password: z.string("El campo es obligatorio")
    .trim()
    .nonempty("El campo no puede estar vacio")
})