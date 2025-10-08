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
    if (!val) return ""
    return val.charAt(0).toUpperCase() + val.substring(1);
}

export const generateExpensesChart = async (data: Prop[]) => {
    const values = data.map(d => ({ ...d, mes: capitalize(d.mes), }))

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

export function formatearFecha(fecha: Date): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  
  return `${dia} de ${mes}, ${año}`;
}


// Types para el reporte de evaluación
interface PlayerEvaluationReport {
    // Datos Biométricos y Generales
    datosGenerales: {
        nombre: string;
        apellido: string;
        edad: number;
        estatura: number;
        peso: number;
        imc: number;
        nacionalidad: string;
        pieHabil: string;
        posicionPrincipal: string;
        fechaIngreso: Date;
        mesesEnSistema: number;
        entrenador: string;
        horario: string;
        ultimaEvaluacion: Date;
        fechaEvaluacion: Date;
        evaluador: string;
        estado: string;
    };

    // Evaluación Técnico-Física
    capacidadesFisicas: {
        velocidad: number;
        resistencia: number;
        agilidad: number;
        fuerza: number;
        coordinacion: number;
        flexibilidad: number;
    };

    habilidadesTecnicas: {
        pase: number;
        control: number;
        despeje: number;
        remate: number;
        regate: number;
        centros: number;
    };

  
}

// Query usando Prisma para obtener toda la información
async function getPlayerEvaluationReport(
    prisma: any,
    playerId: number
): Promise<PlayerEvaluationReport> {

    // 1. Obtener datos del jugador
    const player = await prisma.players.findUnique({
        where: { id: playerId },
        include: {
            users: {
                select: {
                    nombre: true,
                    apellido: true
                }
            }
        }
    });

    if (!player) {
        throw new Error('Jugador no encontrado');
    }

    // 2. Calcular edad
    const edad = calcularEdad(player.fecha_nacimiento);

    // 3. Calcular IMC
    const imc = player.peso && player.talla
        ? Number(player.peso) / Math.pow(Number(player.talla), 2)
        : 0;

    // 4. Calcular meses en el sistema
    const mesesEnSistema = player.fecha_registro
        ? calcularMeses(player.fecha_registro, new Date())
        : 0;

    // 5. Obtener última evaluación completa con detalles
    const ultimaEvaluacion = await prisma.evaluations.findFirst({
        where: { player_id: playerId },
        orderBy: { fecha: 'desc' },
        include: {
            details_evaluation: {
                include: {
                    parameters_evaluation: {
                        include: {
                            types_evaluation: true
                        }
                    }
                }
            },
            types_evaluation: true
        }
    });

    // 6. Obtener historial de evaluaciones
    const historialEvaluaciones = await prisma.evaluations.findMany({
        where: { player_id: playerId },
        orderBy: { fecha: 'desc' },
        take: 10,
        include: {
            details_evaluation: {
                include: {
                    parameters_evaluation: true
                }
            },
            types_evaluation: true
        }
    });

    // 7. Obtener información financiera
    const gastos = await prisma.gasto.findMany({
        where: { player_id: playerId },
        orderBy: { fecha: 'desc' }
    });

    const inversionTotal = gastos.reduce(
        ( sum : any , gasto : any ) => sum + Number(gasto.monto),
        0
    );

    const ultimoGasto = gastos[0];

    // 8. Calcular sesiones (asumiendo que cada gasto representa una sesión)
    const sesionesCompletadas = gastos.length;
    const costoPorSesion = sesionesCompletadas > 0
        ? inversionTotal / sesionesCompletadas
        : 0;

    // 9. Organizar capacidades físicas y habilidades técnicas
    const capacidadesFisicas: any = {
        velocidad: 0,
        resistencia: 0,
        agilidad: 0,
        fuerza: 0,
        coordinacion: 0,
        flexibilidad: 0
    };

    const habilidadesTecnicas: any = {
        pase: 0,
        control: 0,
        despeje: 0,
        remate: 0,
        regate: 0,
        centros: 0
    };

    if (ultimaEvaluacion) {
        ultimaEvaluacion.details_evaluation.forEach( ( detail : any) => {
            const paramName = detail.parameters_evaluation.nombre.toLowerCase();
            const value = detail.value / 10; // Convertir de escala 0-100 a 0-10

            // Capacidades Físicas
            if (paramName.includes('velocidad')) capacidadesFisicas.velocidad = value;
            if (paramName.includes('resistencia')) capacidadesFisicas.resistencia = value;
            if (paramName.includes('agilidad')) capacidadesFisicas.agilidad = value;
            if (paramName.includes('fuerza')) capacidadesFisicas.fuerza = value;
            if (paramName.includes('coordinacion')) capacidadesFisicas.coordinacion = value;
            if (paramName.includes('flexibilidad')) capacidadesFisicas.flexibilidad = value;

            // Habilidades Técnicas
            if (paramName.includes('pase')) habilidadesTecnicas.pase = value;
            if (paramName.includes('control')) habilidadesTecnicas.control = value;
            if (paramName.includes('despeje')) habilidadesTecnicas.despeje = value;
            if (paramName.includes('remate')) habilidadesTecnicas.remate = value;
            if (paramName.includes('regate')) habilidadesTecnicas.regate = value;
            if (paramName.includes('centro')) habilidadesTecnicas.centros = value;
        });
    }

    // 10. Construir historial con evolución
    // const historial = construirHistorial(historialEvaluaciones);

    // 11. Construir el reporte completo
    const reporte: PlayerEvaluationReport = {
        datosGenerales: {
            nombre: player.nombre,
            apellido: player.apellido,
            edad: edad,
            estatura: Number(player.talla) || 0,
            peso: Number(player.peso) || 0,
            imc: Number(imc.toFixed(1)),
            nacionalidad: player.pais,
            pieHabil: player.pie_habil || '',
            posicionPrincipal: player.posicion || '',
            fechaIngreso: player.fecha_registro || new Date(),
            mesesEnSistema: mesesEnSistema,
            entrenador: player.users ? `${player.users.nombre} ${player.users.apellido}` : '',
            horario: '', // Necesitarías agregar este campo
            ultimaEvaluacion: ultimaEvaluacion?.fecha || new Date(),
            fechaEvaluacion: new Date(),
            evaluador: 'Staff Técnico',
            estado: player.prospecto ? 'PROSPECTO ACTIVO' : (player.activo ? 'ACTIVO' : 'INACTIVO')
        },
        capacidadesFisicas,
        habilidadesTecnicas,
       
    };

    return reporte;
}

// Funciones auxiliares
function calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

function calcularMeses(fechaInicio: Date, fechaFin: Date): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const meses = (fin.getFullYear() - inicio.getFullYear()) * 12
        + (fin.getMonth() - inicio.getMonth());

    return meses;
}

function generarObservacion(evolucion: number, parametro: string): string {
    if (evolucion > 0.3) return `Mejora notable en ${parametro.toLowerCase()}`;
    if (evolucion > 0) return `Mayor precisión`;
    if (evolucion < -0.1) return `Requiere trabajo cardiovascular`;
    return `Estable`;
}

function calcularProximoPago(): Date {
    const hoy = new Date();
    const proximoPago = new Date(hoy);
    proximoPago.setMonth(proximoPago.getMonth() + 1);
    proximoPago.setDate(1);
    return proximoPago;
}

// Exportar
export {
    getPlayerEvaluationReport,
    PlayerEvaluationReport
};