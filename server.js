const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

// Transportador SMTP
const transporter = nodemailer.createTransport({
    host: 'mail.danielsalfate.cl',
    port: 465,
    secure: true,
    auth: {
        user: 'contacto@danielsalfate.cl',
        pass: 'Holiday_46'
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor Node funcionando');
});

// Ruta para enviar correos
app.post('/send', async (req, res) => {

    const { nombre, email, tipoEmprendimiento = '', mensaje } = req.body;

    try {

        // Correo a la empresa
        await transporter.sendMail({
            from: '"Formulario Web" <contacto@danielsalfate.cl>',
            to: 'contacto@danielsalfate.cl',
            replyTo: email,
            subject: `Nuevo mensaje de contacto de ${nombre}`,
            html: `
                <b>Nombre:</b> ${nombre}<br/>
                <b>Email:</b> ${email}<br/>
                <b>Tipo:</b> ${tipoEmprendimiento}<br/>
                <b>Mensaje:</b> ${mensaje}
            `
        });

        // Correo al usuario
        await transporter.sendMail({
            from: '"Asesorías NAB" <contacto@danielsalfate.cl>',
            to: email,
            subject: 'Hemos recibido tu mensaje',
            html: `
                <p>Hola <b>${nombre}</b>,</p>
                <p>Hemos recibido tu mensaje y pronto nos pondremos en contacto contigo.</p>
                <p>Saludos<br><b>Asesorías NAB</b></p>
            `
        });

        res.json({
            ok: true,
            message: 'Correos enviados correctamente'
        });

    } catch (err) {

        console.error('Error al enviar correo:', err);

        res.status(500).json({
            ok: false,
            error: err.message
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