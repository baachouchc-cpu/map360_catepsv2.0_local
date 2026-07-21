async function loadPermisosTable(){

    try{

        const res =
        await fetch("/api/permisos");

        const permisos =
        await res.json();

        const table = new DataTable({

        container:"#content",

        idField:"id_permiso",

        columns:{

        title:"Permisos",

        fields:[

            { field:"id_permiso", title:"ID"},
            { field:"nombre_permiso", title:"Permiso"},
            { field:"total_escenas", title:"Total Escenas"},
            {
                field:"custom",
                title:"Tipo",
                formatter:(v)=>{

                return v
                ?
                "Personalizado"
                :
                "Base";

                }
            },
            { field:"parent",title:"Basado en" }

        ]

        },

        data:permisos,

        actions:[

            {
            text:"Editar",
            class:"edit",
            onclick:"editPermiso"
            }

        ]

        });

    }catch(error){

        console.error("Error cargando permisos",error);

    }

}

function editPermiso(id){

openPermisoModal(id);

}

async function openPermisoModal(id=null){

if(document.getElementById("permisoModal"))
return;

const html =
await fetch(
"/admin/components/permisoModal.html"
)
.then(r=>r.text());

document.body.insertAdjacentHTML(
"beforeend",
html
);

document
.getElementById("permisoModal")
.classList.add("show");

await initPermisoForm(id);

}

function closePermisoModal(){

const modal =
document.getElementById(
"permisoModal"
);

if(modal){

modal.remove();

}

}