import e, { Request, Response } from "express";
import { capitalize, formatDate, generateExpensesChart, generateGraph, generateHorizontalBarChart, generateRadarChart, get4MonthDate, getGastosPerMonth, getUserAndPlayerInfo, handleServerError, toPlayerDto } from "../lib/utils";
import { PlayerRequestType, UpdatePlayerType } from "../interfaces/types";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../models/prisma";
import { players, Prisma } from "@prisma/client";
import PdfPrinter from 'pdfmake'
import type { TDocumentDefinitions } from "pdfmake/interfaces";

export const addPlayer = async (req: AuthRequest<PlayerRequestType>, res: Response) => {
    const { user } = req
    const { nombre, apellido, fecha_nacimiento, fecha_registro, identificacion, pais,
        talla, peso, pie_habil, posicion
    } = req.body
    try {
        const isPlayerExist = await prisma.players.findFirst({ where: { identificacion } })
        if (isPlayerExist) {
            return res.status(400).json({ success: false, message: "La identificación ya ha sido registrada" })
        }
        const newPlayer = await prisma.players.create({
            data: {
                nombre,
                apellido,
                fecha_nacimiento: new Date(fecha_nacimiento),
                fecha_registro: new Date(fecha_registro),
                identificacion,
                pais,
                talla,
                peso,
                pie_habil,
                posicion,
                user_id: user?.id
            }
        })
        // res.json(newPlayer)
        res.json({ success: true, message: "Jugador registrado exitosamente" })

    } catch (err) {
        return handleServerError(err, "addPlayerController", res)
    }
}

export const getPlayers = async (req: Request, res: Response) => {

    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5

    if (isNaN(page) || page < 1) page = 1
    if (isNaN(size) || size < 1) size = 5

    try {
        const skip = (page - 1) * size;

        const [data, totalItems] = await Promise.all([
            prisma.players.findMany({
                skip,
                take: size,
                orderBy: { fecha_registro: "desc" }
            }),
            prisma.players.count()
        ])
        const totalPages = Math.ceil(totalItems / size);

        const players = data.map(player => {
            return toPlayerDto(player)
        })

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            size,
            data: players
        })

    } catch (err) {
        return handleServerError(err, "getPlayers", res)
    }
}


export const getPlayer = async (req: Request, res: Response) => {
    const { id } = req.params
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "El ID es inválido" })
    }
    try {
        const player = await prisma.players.findUnique({
            where: { id: Number(id) },
            include: { users: true }
        })
        if (!player) {
            return res.status(400).json({ message: "Jugador no encontrado" })
        }
        const creator = {
            id: player.users?.id,
            email: player.users?.email,
            nombre: player.users?.nombre,
            apellido: player.users?.apellido,
            foto: player.users?.foto
        }
        const response = {
            id: player.id,
            nombre: player.nombre,
            apellido: player.apellido,
            fecha_nacimiento: formatDate(player.fecha_nacimiento),
            fecha_registro: formatDate(player.fecha_registro),
            identificacion: player.identificacion,
            pais: player.pais,
            monto: player.monto,
            talla: player.talla,
            peso: player.peso,
            pie_habil: player.pie_habil,
            posicion: player.posicion,
            user: creator,
            activo: player.activo,
            prospecto: player.prospecto
        }
        res.json(response)

    } catch (err) {
        return handleServerError(err, "getPlayer", res)
    }
}

export const searchPlayer = async (req: Request, res: Response) => {
    const rawQuery = req.query.query
    const query = typeof rawQuery === "string" ? rawQuery.trim() : ""

    try {
        let players: players[];
        if (query === "") {
            players = []
        } else {
            players = await prisma.players.findMany({
                where: {
                    OR: [
                        { nombre: { contains: query } },
                        { apellido: { contains: query } }
                    ]
                }
            })
        }
        const resp = players.map(player => {
            return toPlayerDto(player)
        })
        res.json(resp)

    } catch (err) {
        return handleServerError(err, "searchPlayer", res)
    }
}


export const editPlayer = async (req: Request<{}, {}, UpdatePlayerType>, res: Response) => {
    const { id } = req.params as { id: string }

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "El ID es inválido" })
    }
    try {
        const player = await prisma.players.findUnique({ where: { id: parseInt(id) } })
        if (!player) return res.status(400).json({ message: "Jugador no encontrado" })

        if (req.body.identificacion) {
            const isIdentificacionUsed = await prisma.players.findFirst({
                where: { identificacion: req.body.identificacion, id: { not: player.id } }
            });

            if (isIdentificacionUsed) {
                return res.status(400).json({ message: "No puede usar esa identificacion, ya está registrada" });
            }
        }
        const updated = await prisma.players.update({
            where: { id: Number(id) },
            data: req.body
        })

        // res.json(updated)
        res.json({ success: true, message: "Jugador editado correctamente" })

    } catch (err) {
        return handleServerError(err, "editPlayer", res)
    }
}


export const deletePlayer = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "El ID no es válido" })
    }
    try {
        const player = await prisma.players.findUnique({ where: { id: id } })
        if (!player) return res.status(400).json({ success: false, message: "Jugador no encontrado" })

        await prisma.players.delete({
            where: { id }
        })
        res.json({ success: true, message: "Jugador eliminado correctamente" })
    } catch (err: any) {
        if (err.code == 'P2003') {
            return res.status(400).json({ success: false, message: "No se ha podido eliminar el jugador, tienes registros asociados" })
        }
        return handleServerError(err, "deletePlayer", res)
    }
}


export const setPlayerStatus = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "El ID no es válido" })
    }
    try {
        const player = await prisma.players.findUnique({ where: { id } })
        if (!player) return res.status(400).json({ success: false, message: "Jugador no encontrado" })

        const newStatus = player.activo ? false : true

        const updated = await prisma.players.update({
            where: { id },
            data: { activo: newStatus }
        })

        res.json(toPlayerDto(player))

    } catch (err) {
        return handleServerError(err, "setPlayerStatus", res)
    }
}

export const setPlayerAsProspecto = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ message: "El ID no es válido" })
    }
    try {
        const player = await prisma.players.findUnique({ where: { id } })
        if (!player) return res.status(400).json({ success: false, message: "Jugador no encontrado" })

        const newProspecto = player.prospecto ? false : true

        const updated = await prisma.players.update({
            where: { id },
            data: { prospecto: newProspecto }
        })

        res.json(toPlayerDto(updated))

    } catch (err) {
        return handleServerError(err, "setPlayerStatus", res)
    }
}

export const getPlayerEvaluations = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "El ID no es válido" })
    }
    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5

    if (isNaN(page) || page < 1) page = 1
    if (isNaN(size) || size < 1) size = 5

    try {
        const player = await prisma.players.findUnique({ where: { id } })
        if (!player) return res.status(400).json({ success: false, message: "Jugador no encontrado" })

        const skip = (page - 1) * size

        const [data, totalItems] = await Promise.all([
            prisma.evaluations.findMany({
                skip,
                take: size,
                where: {
                    player_id: id
                },
                omit: { type_evaluation_id: true },
                include: {
                    types_evaluation: true,
                    details_evaluation: {
                        include: { parameters_evaluation: true },
                        omit: { evaluation_id: true, parameter_id: true }
                    }
                },
                orderBy: { fecha: 'desc' }
            }),
            prisma.evaluations.count({ where: { player_id: id } })
        ])

        const totalPages = Math.ceil(totalItems / size)

        const evaluations = data.map(d => toEvaluationResponse(d))

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            size,
            data: evaluations
        })

    } catch (err) {
        return handleServerError(err, "setPlayerStatus", res)
    }
}

const getTopByParameter = async (parametro: string, page: number, size: number) => {
    const offset = (page - 1) * size;

    const totalItemsResult = await prisma.$queryRaw<{ total_items: number }[]>(Prisma.sql`
        SELECT COUNT(DISTINCT p.id) AS total_items
        FROM players p
        JOIN evaluations e ON e.player_id = p.id
        JOIN details_evaluation d ON d.evaluation_id = e.id
        JOIN parameters_evaluation pe ON pe.id = d.parameter_id
        WHERE pe.nombre = ${parametro}
    `);

    const totalItems = Number(totalItemsResult[0]?.total_items) || 0;
    const totalPages = Math.ceil(totalItems / size);

    const results = await prisma.$queryRaw(Prisma.sql`
        SELECT
        p.id AS player_id,
        p.nombre AS nombre,
        p.apellido as apellido,
        p.posicion as posicion,
        pe.nombre as parametro,
        avg(d.value) as value
        FROM players p
        INNER JOIN evaluations e ON e.player_id = p.id
        INNER JOIN details_evaluation d ON d.evaluation_id = e.id
        INNER JOIN parameters_evaluation pe ON pe.id = d.parameter_id
        WHERE pe.nombre = ${parametro}
        GROUP BY p.id, p.nombre, p.apellido, p.posicion, pe.nombre
        ORDER BY value DESC
        LIMIT ${Prisma.raw(String(size))} OFFSET ${Prisma.raw(String(offset))}
        `)

    return {
        currentPage: page,
        pageSize: size,
        totalItems,
        totalPages,
        results
    };
}

// CORREGIR - OBTENER EL TOP DE LA TABLA EVALUATIONS
export const topPlayers = async (req: Request, res: Response) => {

    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5
    const orderBy = req.query.orderBy as string || "velocidad"

    if (isNaN(page) || page < 1) page = 1
    if (isNaN(size) || size < 1) size = 5

    try {
        const data = await getTopByParameter(orderBy, page, size)
        res.json(data)

    } catch (err) {
        return handleServerError(err, "topPlayers", res)
    }
}

export const getPlayerGastos = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ success: false, message: "El ID no es válido" })

    let page = parseInt(req.query.page as string) || 1
    let size = parseInt(req.query.size as string) || 5

    if (isNaN(page) || page < 1) page = 1
    if (isNaN(size) || size < 1) size = 5

    const skip = (page - 1) * size;

    try {
        const player = await prisma.players.findUnique({ where: { id } })
        if (!player) return res.status(400).json({ success: false, message: "El jugador no existe" })

        const [data, totalItems] = await Promise.all([
            prisma.gasto.findMany({
                where: { player_id: player.id },
                skip,
                take: size,
                orderBy: { fecha: 'desc' },
                omit: { user_id: true, player_id: true },
                include: getUserAndPlayerInfo
            }),
            prisma.gasto.count({ where: { player_id: player.id } })
        ])
        const totalPages = Math.ceil(totalItems / size)
        const expenses = data.map(expense => toExpenseResponse(expense))

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            size,
            data: expenses
        })

    } catch (err) {
        return handleServerError(err, "getPlayerGastos", res)
    }

}

const toEvaluationResponse = (evaluation: any) => {
    const { fecha, ...rest } = evaluation
    const resp = {
        fecha: formatDate(fecha),
        ...rest
    }
    return resp
}

const toExpenseResponse = (expense: any) => {
    const resp = {
        id: expense.id,
        monto: expense.monto,
        descripcion: expense.descripcion,
        fecha: formatDate(expense.fecha),
        user: {
            id: expense.user.id,
            email: expense.user.email,
            nombre: expense.user.nombre,
            apellido: expense.user.apellido
        },
        player: {
            id: expense.player.id,
            nombre: expense.player.nombre,
            apellido: expense.player.apellido,
            identification: expense.player.identificacion
        }
    }
    return resp
}

const fonts = {
    Roboto: {
        normal: "fonts/Roboto-Regular.ttf",
        bold: "fonts/Roboto-Bold.ttf",
        italics: "fonts/Roboto-Italic.ttf",
        bolditalics: "fonts/Roboto-BoldItalic.ttf",
    },
};

const printer = new PdfPrinter(fonts);

export const exportPlayerData = async (req: Request, res: Response) => {
    const { id } = req.params
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "El ID no es válido", success: false })
    }
    try {
        const player = await prisma.players.findUnique({
            where: { id: parseInt(id) }
        })
        if (!player) {
            return res.status(400).json({ message: "Jugador no encontrado", success: false })
        }

        const firstDateOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()

        const evaluacionFisico = await prisma.types_evaluation.findFirst({ where: { nombre: "fisico" } })

        let dataset = null

        if (evaluacionFisico) {

            const registeredEvaluations = await prisma.evaluations.findMany({
                where: {
                    player_id: player.id, type_evaluation_id: evaluacionFisico.id
                },
                include: { details_evaluation: { include: {parameters_evaluation: true}} }
            })

            const parameters = await prisma.parameters_evaluation.findMany({ where: { type_id: evaluacionFisico.id } })

            const averages = parameters.map(param => {
                const allValues = registeredEvaluations
                    .flatMap(e => e.details_evaluation)
                    .filter(d => d.parameter_id === param.id)
                    .map(d => d.value)

                const avg = allValues.length > 0
                    ? allValues.reduce((sum, v) => sum + v, 0) / allValues.length
                    : 0

                return { nombre: param.nombre, promedio: avg }
            })
            dataset = averages
        }

        const targetDate = get4MonthDate()

        const gastos = await prisma.gasto.findMany({
            where: { player_id: parseInt(id), fecha: 
                {gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), 1) ,  }  }, orderBy: {fecha: "desc"}
         })

        const gastosAll = await prisma.gasto.findMany({where: {player_id: parseInt(id)}, orderBy: {fecha: "desc"} } )
        const lastGasto = gastosAll[0]

        const totalGastos = gastosAll.reduce((acc, gasto) => acc + Number(gasto.monto), 0);

        // group by month
        const dataGastos = getGastosPerMonth(gastos)

        const expensesChart = await generateExpensesChart( dataGastos )
        const horizontalChart = await generateHorizontalBarChart(dataset)

        const evaluationsData = await prisma.evaluations.findMany({
            where: {player_id: parseInt(id)}, include: {types_evaluation: true, 
                details_evaluation: {include: {parameters_evaluation: true}} }, 
        orderBy: {fecha: "desc"} })
        
        
        const evaluaciones : any = evaluationsData.flatMap( ev => {
            return ev.details_evaluation.map( det => ({
                fecha: formatDate(ev.fecha),
                tipo: `${capitalize(ev.types_evaluation?.nombre)}`,
                detalle: capitalize(det.parameters_evaluation.nombre),
                valor: det.value
            }))
        })
       
        const today = new Date().toISOString().split("T")[0]

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: `Reporte del Jugador - ${player.nombre} ${player.apellido}`, style: "header" },
                { text: `Fecha de generación: ${today}`, style: "subtitle", margin: [0, 0, 0, 35] },
                {
                    margin: [0, 0, 0, 30],
                    columns: [
                        {
                            width: "50%",
                            stack: [
                                {
                                    text: `Datos Personales`,
                                    style: "subheader",
                                    margin: [0, 0, 0, 15]
                                },
                                {
                                    table: {
                                        widths: ['30%', '70%'],
                                        body: [
                                            [
                                                { text: 'Nombre', bold: true, color: 'black' },
                                                { text: `${player.nombre} ${player.apellido}` }
                                            ],
                                            [
                                                { text: 'Edad', bold: true, color: 'black' },
                                                { text: '14 años' }
                                            ],
                                            [
                                                { text: 'País', bold: true, color: 'black' },
                                                { text: player.pais }
                                            ],
                                            [
                                                { text: 'Posición', bold: true, color: 'black' },
                                                { text: player.posicion }
                                            ],
                                            [
                                                { text: 'Pie Hábil', bold: true, color: 'black' },
                                                { text: player.pie_habil }
                                            ],
                                            [
                                                { text: 'Estatura', bold: true, color: 'black' },
                                                { text: `${player.talla} m` }
                                            ],
                                            [
                                                { text: 'Peso', bold: true, color: 'black' },
                                                { text: `${player.peso} kg` }
                                            ],
                                            [
                                                { text: 'Prospecto', bold: true, color: 'black' },
                                                { text: player.prospecto ? "Si" : "No" }
                                            ],
                                        ]
                                    },
                                    layout: {
                                        hLineWidth: () => 1,
                                        vLineWidth: () => 1,
                                        hLineColor: () => '#ccc',
                                        vLineColor: () => '#ccc',
                                    }
                                }
                            ]
                        },
                        {
                            width: "50%",
                            stack: [
                                {
                                    text: `Promedio de Evaluacion: Físico`,
                                    fontSize: 12,
                                    bold: true,
                                    margin: [0, 0, 0, 15]
                                },
                                horizontalChart
                                    ?
                                    {
                                        image: "data:image/png;base64," + horizontalChart,
                                        width: 270,
                                    }
                                    : {
                                        text: `El jugador aun no tiene evaluaciones de tipo físico registradas`,
                                        fontSize: 10,
                                        italics: true
                                    }
                            ]
                        }
                    ],
                },
                {
                    margin: [0, 0, 0, 30],
                    columns: [
                        {
                            width: "50%",
                            stack: [
                                {
                                    text: `Total de gastos en los últimos 4 meses`,
                                    fontSize: 12,
                                    bold: true,
                                    margin: [0, 0, 0, 14]
                                },
                                {
                                    image: "data:image/png;base64," + expensesChart,
                                    width: 250,
                                }
                            ]
                        },
                        {
                            width: "50%",
                            stack: [
                                {
                                    text: `Resumen Económico`,
                                    fontSize: 12,
                                    bold: true,
                                    margin: [0, 0, 0, 15]
                                },
                                {
                                    table: {
                                        widths: ['30%', '70%'],
                                        body: [
                                            [
                                                { text: 'Monto Total Invertido', bold: true, color: 'black' },
                                                { text: `S/ ${totalGastos}` }
                                            ],
                                            [
                                                { text: 'Ultimo Gasto', bold: true, color: 'black' },
                                                { text: `S/ ${lastGasto?.monto} - ${lastGasto?.descripcion}` }
                                            ]
                                        ]
                                    },
                                    layout: {
                                        hLineWidth: () => 1,
                                        vLineWidth: () => 1,
                                        hLineColor: () => '#ccc',
                                        vLineColor: () => '#ccc',
                                    }
                                }
                            ]
                        }
                    ]
                },
                { text: "Evaluaciones Recientes", style: "subheader", margin: [0, 10, 0, 20] },
                {
                    table: {
                        widths: ["*", "*", "*", "*"],
                        body: [
                            [ {text: "Fecha", bold: true } , 
                                {text: "Tipo", bold: true }, 
                                {text: "Parametro", bold: true }, 
                                {text: "Valor", bold: true }
                            ],
                            ...evaluaciones.map( ( g : any ) => [g.fecha, g.tipo, g.detalle, g.valor]),
                        ],
                    },
                    layout: {
                        hLineWidth: () => 1,
                        vLineWidth: () => 1,
                        hLineColor: () => '#ccc',
                        vLineColor: () => '#ccc',
                    }
                },
            ],
            styles: {
                header: { fontSize: 24, bold: true, margin: [0, 0, 0, 10], alignment: "center" },
                subtitle: { fontSize: 12, bold: false, alignment: "center" },
                subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
            },
            defaultStyle: {
                columnGap: 20
            }
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachment; filename=reporte.pdf")

        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        return handleServerError(err, "exportPlayerData", res)
    }
}