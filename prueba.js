const {Builder, By, Key, util, Button} = require("selenium-webdriver");
const URL = "http://localhost:4200"
const MS_SLEEP = 1000;

general();

async function general()
{   const usuario_uno = create_rnd_user();
    const usuario_dos = create_rnd_user();
    const rol = ["Editor", "Lector"];
    const estado = ["Por hacer", "En progreso", "Finalizada"];
    const id_estado = Math.floor(((Math.random()*4)%3));
    const proyecto = {nombre: make_rnd_string(10), descripcion: make_rnd_string(30), visibilidad: Math.random() > 0.5};
    const tarea = {nombre: make_rnd_string(10), descripcion: make_rnd_string(30), estado: estado[id_estado]};
    console.log("========================================================");
    console.log("Datos generados aleatoriamente: ");
    console.log("Usuario 1: ", JSON.stringify(usuario_uno));
    console.log("Usuario 2: ", JSON.stringify(usuario_dos));
    console.log("Proyecto: "+ JSON.stringify(proyecto));
    console.log("Tarea: "+ JSON.stringify(tarea));
    console.log("========================================================");
    let driver_uno = await new Builder().forBrowser("firefox").build();
    let driver_dos = await new Builder().forBrowser("firefox").build();

    await register(usuario_uno, driver_uno);
    await register(usuario_dos, driver_dos);
    await login(usuario_uno, driver_uno);
    await login(usuario_dos, driver_dos);
    await crear_proyecto(driver_uno, proyecto);
    await ver_proyecto(driver_uno, proyecto);
    await agregar_miembro(driver_uno, usuario_dos, rol[0]);
    await ver_proyecto(driver_dos, proyecto);
    await crear_tarea(driver_dos, usuario_uno, tarea);
    await ver_proyecto(driver_uno, proyecto);
    await ver_lista_tareas(driver_uno);
}

function create_rnd_user()
{   return  { username: make_rnd_string(16), email: make_rnd_string(16), password: make_rnd_string(16) };
}

async function register(user, driver)
{   return new Promise(async resolve => {
        try{
            await driver.get(URL+"/home");                   // Inicio de la prueba en la ruta /home
            await driver.sleep(MS_SLEEP);                                               // SLEEP
            await driver.findElement(By.xpath("//a[@href='/register']")).click();   // -- Ir a la ruta /register --
            await driver.findElement(By.id("email")).sendKeys(user.email);          //Input text - Email
            await driver.findElement(By.id("usert")).sendKeys(user.username);       //Input text - Usuario
            await driver.findElement(By.id("psw")).sendKeys(user.password);         //Input text - Contraseña
            await driver.findElement(By.id("psw-repeat")).sendKeys(user.password);  //Input text - Repetición de la contraseña
            await driver.findElement(By.className("button button1")).click();       //Input button - Registrarse -- Redirección a la ruta /home
            await driver.sleep(MS_SLEEP); 
            resolve(console.log("[OK] Registro de usuario ("+user.username+")."));
        }catch(err)
        {   resolve(console.log("[ERR] Registro de usuario ("+user.username+")."));
            console.log(err);
        }
    });
}

async function login(user, driver)
{   return new Promise(async resolve => {
        try{
            await driver.get(URL+"/home");
            await driver.sleep(MS_SLEEP); 
            await driver.findElement(By.xpath("//a[@href='/login']")).click();      //-- Ir a la ruta /login -- 
            await driver.findElement(By.id("usert")).sendKeys(user.username);       //Input text - Usuario
            await driver.findElement(By.id("psw")).sendKeys(user.password);         //Input text - Contraseña
            await driver.findElement(By.className("button button1")).click();       //Input button - Iniciar sesión -- Redirección a la ruta /home      
            await driver.sleep(MS_SLEEP); 
            resolve(console.log("[OK] Inicio de sesión del usuario ("+user.username+")."));
        }catch(err)
        {   resolve(console.log("[ERR] Inicio de sesión del usuario ("+user.username+")."));
            console.log(err);
        }
    });
}

async function crear_proyecto(driver, proyecto) // proyecto.nombre proyecto.descripcion proyecto.visibilidad
{   return new Promise(async resolve => {
        try{
            await driver.get(URL+"/home");
            await driver.sleep(MS_SLEEP);
            await driver.findElement(By.xpath("//a[@href='/create-project']")).click(); 
            await driver.findElement(By.id("proyect")).sendKeys(proyecto.nombre);       //Input text - Usuario
            await driver.findElement(By.id("description")).sendKeys(proyecto.descripcion);
            if(proyecto.visibilidad){
                await driver.findElement(By.xpath("//*[@ng-reflect-name='visibilidad']")).click();
            }
            await driver.findElement(By.className("button button1")).click();
            resolve(console.log("[OK] Creación del proyecto ("+proyecto.nombre+")."));
        }catch(err)
        {   resolve(console.log("[ERR] Creación del proyecto ("+proyecto.nombre+")."));
            console.log(err);
        }
    });
}

async function ver_proyecto(driver, proyecto) // Accede al menu del proyecto creado
{   return new Promise(async resolve => {
        try{
            await driver.get(URL+"/home");
            await driver.sleep(MS_SLEEP);
            await driver.findElement(By.xpath("//a[@href='/my-projects']")).click();            //Ir a la seccion mis proyectos
            await driver.sleep(MS_SLEEP);
            await driver.findElement(By.xpath("//*[contains(text(),'"+proyecto.nombre+"')]")).click();
            resolve(console.log("[OK] Vista del menú principal del proyecto ("+proyecto.nombre+")."));
        }catch(err)
        {   resolve(console.log("[ERR] Vista del menú principal del proyecto ("+proyecto.nombre+")."));
            console.log(err);
        }
    });
}

async function agregar_miembro(driver, usuario, rol) // Tiene que estar en el menu del proyecto
{   return new Promise(async resolve => {
        try{
            await driver.sleep(MS_SLEEP);
            await driver.findElement(By.xpath("//*[contains(text(),'Participantes')]")).click();
            await driver.findElement(By.xpath("//*[contains(text(),'Agregar miembro')]")).click();
            await driver.findElement(By.name("participante")).sendKeys(usuario.username);                //Usuario del nuevo miembro
            await driver.findElement(By.xpath("//select[@ng-reflect-name='rol']")).click();   
            await driver.findElement(By.xpath("//*[contains(text(),'"+rol+"')]")).click();        //Seleccion del rol // "Creador", "Editor", "Lector"
            await driver.findElement(By.className("button button1")).click();                    //Agregar miembro
            resolve(console.log("[OK] Agregación del miembro ("+usuario.username+") como ("+rol+")."));
        }catch(err)
        {   resolve(console.log("[ERR] Agregación del miembro ("+usuario.username+") como ("+rol+")."));
            console.log(err);
        }
});
}
async function crear_tarea(driver, usuario, tarea) // Tiene que estar en el menu del proyecto
{   return new Promise(async resolve => {
        try{
            //Ir a la seccion de crear nueva tarea
            await driver.sleep(MS_SLEEP);
            await driver.findElement(By.xpath("//*[contains(text(),'Tareas')]")).click();
            await driver.findElement(By.xpath("//*[contains(text(),'Crear tarea')]")).click();
            //Lenar formulario de nueva tarea
            await driver.findElement(By.name("nombre")).sendKeys(tarea.nombre);                     //Nombre
            await driver.findElement(By.name("descripcion")).sendKeys(tarea.descripcion);           //Descripción
            await driver.findElement(By.xpath("//select[@ng-reflect-name='id_estado']")).click();   
            await driver.findElement(By.xpath("//*[contains(text(),'"+tarea.estado+"')]")).click();        //Estado // "Por hacer", "En progreso", "Finalizada"
            await driver.findElement(By.xpath("//*[contains(text(),'"+usuario.username+"')]//parent::span//parent::div//parent::article")).click();                                    //encargado
            await driver.findElement(By.className("button button1")).click();                       //Crear tarea
            resolve(console.log("[OK] Creación de tarea ("+tarea.nombre+")."));
        }catch(err)
        {   resolve(console.log("[ERR] Creación de tarea ("+tarea.nombre+")."));
            console.log(err);
        }
    });
}

async function ver_lista_tareas(driver) // Tiene que estar en el menu del proyecto
{   return new Promise(async resolve => {
        try{
            await driver.findElement(By.xpath("//*[contains(text(),'Tareas')]")).click();
            await driver.findElement(By.xpath("//*[contains(text(),'Listar tareas')]")).click();
            resolve(console.log("[OK] Listado de tareas."));
        }catch(err)
        { resolve(console.log("[ERR] Listado de tareas."));
            console.log(err);
        }
    });
}

function make_rnd_string(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz0123456789_'; // FIXME: ; Da error en la consulta SQL - \\ da error de lectura TODO: Evitar simbolos para evitar inyección SQL
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
