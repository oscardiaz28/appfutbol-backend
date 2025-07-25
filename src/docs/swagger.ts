import swaggerJSDoc, {OAS3Definition, OAS3Options} from "swagger-jsdoc";

const swaggerDefinition : OAS3Definition = {
    openapi: "3.0.0",
    info: {
        title: "API de Aplicacion de Futbol",
        version: "1.0.0"
    },
    servers: [{url: "http://localhost:5000"}],
    tags: [
        {name: "Autenticación"},
        {name: "Usuarios"},
        {name: "Jugadores"}, 
        {name: "Evaluaciones"}, 
        {name: "Tipo de Evaluaciones"}, 
    ]
}

const swaggerOptions : OAS3Options = {
    swaggerDefinition,
    apis: ["./src/routes/*.ts"]
}

export default swaggerJSDoc(swaggerOptions)