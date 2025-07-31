import { createUser } from "./create-admin";
import { createPermissions } from "./create-permission";
import { createRol } from "./create-rol";

const seed = async () => {
    try{
        await createRol();
        await createPermissions();
        await createUser();
        
        console.log("✅ Seed completo");
    }catch(err){

        let message;
        if(err instanceof Error){
            message = err.message;
        }
        console.log(`❌ Error al hacer seed: ${message}`)
    }
}
seed()