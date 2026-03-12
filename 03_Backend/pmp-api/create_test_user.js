import "dotenv/config";
import admin from "./src/firebase.js";

async function createTestUser() {
    const email = "tecnico@pmp.com";
    const password = "password123";

    try {
        try {
            await admin.auth().getUserByEmail(email);
            console.log(`Usuario ${email} ya existe. Actualizando password...`);
            const user = await admin.auth().getUserByEmail(email);
            await admin.auth().updateUser(user.uid, { password });
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                console.log(`Creando usuario ${email}...`);
                await admin.auth().createUser({
                    email,
                    password,
                    displayName: "Técnico Pruebas"
                });
            } else {
                throw e;
            }
        }
        console.log("---------------------------------------------------");
        console.log("USUARIO DE PRUEBA LISTO:");
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log("---------------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Error creando usuario:", error);
        process.exit(1);
    }
}

createTestUser();
