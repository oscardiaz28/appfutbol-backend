import bcrypt from 'bcryptjs'
import { response, Response } from 'express'
import jwt from 'jsonwebtoken'
import { transporte } from './mailer';
import { PlayerDto, UserResponseDto, UserType } from '../interfaces/types';
import path from 'node:path';
import fs from 'node:fs'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { Prisma } from '@prisma/client';

const width = 500;
const height = 300;
const chartjs = new ChartJSNodeCanvas({ width, height });

export const randomToken = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

export const hasAdminRole = (user?: UserType) => {
    return user?.rol.nombre === "admin"
}

export const generateToken = (userId: number) => {
    const payload = {
        userId: userId
    }
    const token = jwt.sign(payload, <string>process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    return token
}

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export const handleServerError = (err: unknown, context: string, res: Response) => {
    if (err instanceof Error) {
        console.error(`❌ ${context}:`, err.message)
    } else {
        console.error(`❌ ${context}:`, err)
    }
    return res.status(500).json({ success: false, message: "Ha ocurrido un error, intentar mas tarde" })
}

type EmailData = {
    name: string,
    token: string,
    subject: string
}

export const getEmailTemplate = (type: typeEmail, data: EmailData) => {
    switch (type) {
        case 'password_reset':
            return `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px; background-color: #fafafa;">
                    <h2 style="color: #2a7ae2; text-align: center;">🔐 Recupera tu cuenta</h2>
                    <p style="font-size: 16px; color: #333;">Hola <strong>${data.name || ''}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">
                        Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar con el proceso:
                    </p>
                    <div style="margin: 30px auto; padding: 15px 25px; background-color: #f1f5fb; color: #2a7ae2; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; width: fit-content; border: 1px dashed #2a7ae2;">
                        ${data.token}
                    </div>
                    <p style="font-size: 14px; color: #666;">
                        Si tú no realizaste esta solicitud, puedes ignorar este correo electrónico.
                    </p>
                    <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 40px;">
                        © 2025 TuApp. Todos los derechos reservados.
                    </p>
                    </div>
            `;
        default:
            return `<p>Unknow email type</p>`;
    }
}

type typeEmail = "password_reset" | "email_verification"

export const getMinutes = () => {
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    return expires.toISOString();
}

export const sendMail = async (to: string, typeEmail: typeEmail, data: EmailData) => {
    const htmlContent = getEmailTemplate(typeEmail, data);
    const mailOptions: any = {
        from: `"Servidor API" <${process.env.GMAIL_USER}>`,
        to,
        subject: data.subject || "Mensaje del Sistema",
        html: htmlContent
    }
    await transporte.sendMail(mailOptions);
}


export const rolWithPermissionInclude = {
    permissions: { omit: { roleId: true, permissionId: true }, include: { permission: true } }
}

export const getUserAndPlayerInfo = {
    user: { select: { id: true, email: true, nombre: true, apellido: true } },
    player: { select: { id: true, nombre: true, apellido: true, identificacion: true } }
}


export function deleteImageIfExists(filename: string | undefined | null) {
    if (!filename) return
    const imagePath = path.join(__dirname, '..', '..', 'uploads', filename)
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
    }
}

export const formatDate = (date: Date | null): string | null => {
    if (!date) return null
    return date.toISOString().split("T")[0];
}

export function toUserDto(user: any): UserResponseDto {
    return {
        id: user.id,
        email: user.email,
        foto: user.foto,
        fecha_registro: formatDate(user.fecha_registro),
        nombre: user.nombre,
        apellido: user.apellido,
        estado: user.estado,
        rol: user.roles
    }
}

export const toPlayerDto = (player: any): PlayerDto => {
    return {
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
        user_id: player.user_id,
        activo: player.activo,
        prospecto: player.prospecto
    }
}

interface Prop {
    mes: string,
    total: number
}

export const capitalize = (val: string | undefined) => {
    if(!val) return ""
    return val.charAt(0).toUpperCase() + val.substring(1);
}

export const generateExpensesChart = async (data: Prop[]) => {
    const values = data.map( d => ({ ...d, mes: capitalize(d.mes), }) )

    const meses = values.map(d => d.mes);
    const totales = values.map(d => d.total);

    const configuration: any = {
        type: "bar",
        data: {
            labels: meses,
            datasets: [
                {
                    data: totales,
                    backgroundColor: [
                        '#f44a4aff',
                        '#1cc88a',
                        '#36b9cc',
                        '#f6c23e',
                    ],
                    borderWith: 1
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    }
    const image = await chartjs.renderToBuffer(configuration)
    return image.toString("base64")
}

export const generateHorizontalBarChart = async (dataset: any) => {
    if (dataset == null) {
        return null
    }
    const labels = dataset.map((a: any) => a.nombre)
    const data = dataset.map((a: any) => a.promedio)

    const configuration: any = {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    data,
                    backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
                },
            ],
        },
        options: {
            indexAxis: 'y',
            responsive: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: { beginAtZero: true },
            },
        },
    }
    const image = await chartjs.renderToBuffer(configuration)
    return image.toString("base64")
}

export const generateRadarChart = async () => {
    const configuration: any = {
        type: "radar",
        data: {
            labels: [
                'Eating',
                'Drinking',
                'Sleeping',
                'Designing',
                'Coding',
                'Cycling',
                'Running'
            ],
            datasets: [
                {
                    data: [28, 48, 40, 19, 96, 27, 100],
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(54, 162, 235)'
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false }
            },
            elements: {
                line: {
                    borderWidth: 3
                }
            }
        }
    }
    const image = await chartjs.renderToBuffer(configuration)
    return image.toString("base64")
}

export const generateGraph = async () => {
    const configuration: any = {
        type: "bar",
        data: {
            labels: ["Agosto", "Septiembre"],
            datasets: [
                {
                    label: "Gastos ($)",
                    data: [15, 30], // ejemplo: gastos filtrados
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                },
                {
                    label: "Evaluaciones promedio",
                    data: [8, 7], // ejemplo: promedio por mes
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                },
            ],
        },
        options: {
            responsive: false,
            plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Resumen mensual" },
            },
        },
    };
    const image = await chartjs.renderToBuffer(configuration)
    return image.toString("base64")
}

export const get4MonthDate = () => {
    const today = new Date()
    const target = new Date()
    target.setMonth(today.getMonth() - 3)
    return target;
}

interface Props {
    id: number;
    monto: Prisma.Decimal;
    user_id: number;
    descripcion: string;
    fecha: Date;
    player_id: number;
}

export const getGastosPerMonth = (gastos: Props[]) => {
    const hoy = new Date()

    const gastosPorMesMap: Record<string, number> = {};
    for (let i = 0; i < 4; i++) {
        const fecha = new Date();
        fecha.setMonth(hoy.getMonth() - i);
        const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
        gastosPorMesMap[key] = 0;
    }

    gastos.forEach(g => {
        const key = `${g.fecha.getFullYear()}-${String(g.fecha.getMonth() + 1).padStart(2, "0")}`;
        if (gastosPorMesMap[key] !== undefined) {
            gastosPorMesMap[key] += Number(g.monto);
        }
    });

    const formatter = new Intl.DateTimeFormat("es-ES", { month: "long" });

    const gastosPorMesArray = Object.entries(gastosPorMesMap)
        .sort(([a], [b]) => a.localeCompare(b)) 
        .map(([key, total]) => {
            const [year, month] = key.split("-");
            const fecha = new Date(Number(year), Number(month) - 1, 1);
            return {
                mes: formatter.format(fecha), 
                total,
            };
        });

    return gastosPorMesArray;
}