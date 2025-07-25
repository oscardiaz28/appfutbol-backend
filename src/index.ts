import dotenv from 'dotenv'
import express, { Request, Response } from 'express';
import morgan from 'morgan'
import cors from 'cors'
import { authRoutes } from './routes/auth.route';
import { handleSyntaxError } from './middlewares/handleSyntaxError';
import { playerRoutes } from './routes/player.route';
import { typeEvaluationRoutes } from './routes/type-evaluation.route';
import { evaluationRoutes } from './routes/evaluation.route';
import swaggerUI from 'swagger-ui-express';
import swaggerSetup from './docs/swagger';
import { rolRoutes } from './routes/rol.route';
import { userRoutes } from './routes/user.route';

dotenv.config()
const PORT = process.env.PORT || 5000
const app = express()

app.use("/docs",swaggerUI.serve, swaggerUI.setup(swaggerSetup))

app.use(morgan('dev'))
app.use(express.json())
app.use(handleSyntaxError)

app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use("/api/auth", authRoutes)
app.use("/api/players", playerRoutes)
app.use("/api/type-evaluation", typeEvaluationRoutes)
app.use("/api/evaluations", evaluationRoutes)
app.use("/api/roles", rolRoutes)
app.use("/api/users", userRoutes)


// app.use("/api/expenses", )
// app.use("/api/users", )

app.use( (req: Request, res: Response) =>{
    res.status(400).json({message: "Ruta no encontrada"})
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})