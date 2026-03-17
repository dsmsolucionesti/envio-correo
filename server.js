const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

// Transportador SMTP
const transporter = nodemailer.createTransport({
    host: 'mail.dsmsoluciones.cl',
    port: 465,
    secure: true,
    auth: {
        user: 'contacto@dsmsoluciones.cl',
        pass: 'DSMSoluciones.'
    }
});

// Función para cargar template y reemplazar variables
function loadTemplate(templateName, variables) {
    const templatePath = path.join(__dirname, templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value || '');
    }

    return template;
}

app.get('/', (req, res) => {
    res.send('Servidor Node funcionando');
});

// Ruta para enviar correos
app.post('/send', async (req, res) => {

    const { nombre, rut, cargo, nombreEmpresa, telefono, email, asunto, mensaje } = req.body;

    try {

        // Correo a la empresa
        await transporter.sendMail({
            from: '"Contacto de cliente" <contacto@dsmsoluciones.cl>', //quien lo envía
            to: 'contacto@dsmsoluciones.cl', //a quien le llega
            replyTo: email,
            subject: `Nuevo correo de cliente`,
            html: `
                <b>Nombre:</b> ${nombre}<br/>
                <b>RUT:</b> ${rut}<br/>
                <b>Cargo:</b> ${cargo}<br/>
                <b>Nombre de la empresa:</b> ${nombreEmpresa}<br/>
                <b>Teléfono:</b> ${telefono}<br/>
                <b>Email:</b> ${email}<br/>
                <b>Asunto:</b> ${asunto}<br/>
                <b>Mensaje:</b> ${mensaje}
            `
        });

        // Correo al usuario usando template
        const templateVars = {
            nombre,
            rut: rut || '',
            cargo: cargo || '',
            nombreEmpresa: nombreEmpresa || '',
            telefono: telefono || '',
            email,
            asunto: asunto || '',
            mensaje
        };

        const htmlContent = loadTemplate('correo_cliente.html', templateVars)
            .replace('src="img/logo.png"', 'src="cid:logo"');

        await transporter.sendMail({
            from: '"AGCI Industrial SpA" <contacto@dsmsoluciones.cl>',
            to: email,
            subject: 'Hemos recibido tu mensaje',
            html: htmlContent,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, 'img', 'logo.png'),
                cid: 'logo'
            }]
        });

        res.json({
            ok: true,
            message: 'Correo enviado correctamente'
        });

    } catch (err) {

        console.error('Error al enviar correo:', err);

        res.status(500).json({
            ok: false,
            error: `Error al enviar correo ${err.message}`
        });

    }

});

// Manejo de errores global
process.on('uncaughtException', err => {
    console.error('ERROR GLOBAL:', err);
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});

module.exports = app;