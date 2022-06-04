//dependencias
const express = require('express');
const app = express();
const exphbs = require("express-handlebars");
const {engine} = require("express-handlebars");
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const secret = '1234';
//traer modulos
const {
    nuevoSkater,
    getSkaters,
    getSkater,
    actualizarSkater,
    borrarSkater,
    setSkaterStatus,
} = require("./consultas.js");
//levantar servidor
const puerto = process.env.PUERTOS || 3000;
const servidor = process.env.HOSTORG || 'localhost';

app.listen(puerto, () => console.log(`Servidor Disponible >> http://${servidor}:${puerto} << `));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//
app.use(express.static(__dirname + '/public'));
app.use("/css", express.static(__dirname + "/public/css")); 

 app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"))
 app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"))

app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "Tamaño de la imagen excede el maximo permitido",
    })
);


app.set("view engine", "handlebars");

app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "Main",
      layoutsDir: `${__dirname}/views/mainLayout`, //directorio de los layouts
    })
  );


app.get("/", async(req,res) => {
    try {
        //const skaters = await getSkaters()
        res.render("Index");
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});


app.get("/registro", (req, res) => {
    res.render("registro")
})
app.post('/registro', async (req, res) => {
    const skater = req.body;
    console.log(skater)
  
    try {
      //await nuevoSkater(skater);
      res.redirect('/Admin');
    } catch (error) {
      res.status(500).send({
        code: 500,
        message: 'No se pudo crear Usuario',
      });
    }
  })
app.get("/usuario", (req, res) => {
    const { token } = req.query
    jwt.verify(token, secret, (err, skater) => {
        if (err) {
            res.status(500).send({
                error: `Algo salió mal...`,
                message: err.message,
                code: 500
            })
        } else {
            res.render("Usuario", { skater });
        }
    })
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const skater = await getSkater(email, password)
        const token = jwt.sign(skater, secret)
        res.status(200).send(token)
    } catch (e) {
        console.log(e)
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

 app.get("/usuarios", async (req, res) => {
      try {
          const skaters = await getSkaters()
          res.render("Admin", {
              skaters
          })
      } catch (err) {
          res.status(500).send({
              error: `Un Error!!!!! ${err}`,
              code: 500
          })
      }
 })
 //api RESt
 app.get("/ingresos", async (req, res) => {

    try {
        const skaters = await getSkaters()
        res.status(200).send(skaters);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});
app.post("/login", async (req, res) => {
    const skaters = req.body;
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send("No se encontro ningun archivo en la consulta");
    }
    const { files } = req
    const { foto } = files;
    const { name } = foto;
    const pathPhoto = `/img/${name}`
    foto.mv(`${__dirname}/public/${pathPhoto}`, async (err) => {
        try {
            if (err) throw err
            skaters.foto = pathPhoto
            await nuevoSkater(skaters);
            res.status(201).redirect("Perfil");
        } catch (e) {
            console.log(e)
            res.status(500).send({
                error: `Algo salió mal... ${e}`,
                code: 500
            })
        };

    });
})

app.put("/usuario", async (req, res) => {
    const skater = req.body;
    try {
        await actualizarSkater(skater);
        res.status(200).send("actualizados exitosamente!!");
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.put("/usuario/status/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await setSkaterStatus(id, estado);
        res.status(200).send("Estatus de skater actualizados exitosamente!!");
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.delete("/usuario/:id", async (req, res) => {
    const { id } = req.params
    try {
        await borrarSkater(id)
        res.status(200).send();
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

   