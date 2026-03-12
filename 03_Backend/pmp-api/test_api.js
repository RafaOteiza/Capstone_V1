
import axios from 'axios';
import "dotenv/config";

async function testCreateOS() {
    try {
        console.log("Testing POST http://localhost:4000/api/os/crear ...");

        // Necesitamos un token válido. 
        // COMO NO TENEMOS TOKEN FÁCILMENTE, probamos si responde al menos 401 Unauthorized.
        // Si responde 401, el backend ESTÁ VIVO.
        // Si da Network Error, el backend ESTÁ MUERTO.

        const res = await axios.post('http://localhost:4000/api/os/crear', {});
        console.log("Response:", res.status, res.data);
    } catch (error) {
        if (error.response) {
            console.log("✅ Backend VIVO. Respondió:", error.response.status, error.response.data);
        } else if (error.request) {
            console.log("❌ Backend MUERTO. No hubo respuesta (Network Error local).");
            console.log(error.message);
        } else {
            console.log("Error:", error.message);
        }
    }
}

testCreateOS();
