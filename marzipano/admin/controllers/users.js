/*=============================================
=               TABLA USUARIOS                =
=============================================*/

async function loadUsersTable(){

    try{
        
        const response = await fetch("/api/adminusers");
        const users = await response.json();
        
        const table = new DataTable({

            container : "#content",

            idField : "id_user",

            columns:{

                title:"Usuarios",


                fields:[
                    { field:"id_user", title:"ID" },
                    { field:"name_user", title:"Usuario" },
                    { field:"nombre", title:"Nombre" },
                    { field:"name_rol", title:"Rol" },
                    { field:"nombre_permiso", title:"Permiso" },
                    { 
                        field:"is_active",
                        title:"Estado",
                        formatter:(value,row)=>`

                        ${
                                isAdmin()
                                ?
                                `
                                <label class="switch">
                                    <input
                                    type="checkbox"
                                    ${value ? "checked":""}
                                    onchange="
                                    toggleUserStatus(
                                        ${row.id_user},
                                        this.checked,
                                        this
                                    )
                                    "
                                    >
                                    <span class="slider"></span>
                                </label>
                                `
                                :
                                `
                                <span>
                                    ${value?"Activo":"Inactivo"}
                                </span>
                                `
                            }
                        `
                    },
                    { 
                        field:"is_config",
                        title:"Configuración",
                        formatter:(value,row)=>`

                        ${
                                isAdmin()
                                ?
                                `
                                <label class="switch">
                                    <input
                                    type="checkbox"
                                    ${value ? "checked":""}
                                    onchange="
                                    toggleUserConfig(
                                        ${row.id_user},
                                        this.checked,
                                        this
                                    )
                                    "
                                    >
                                    <span class="slider"></span>
                                </label>
                                `
                                :
                                `
                                <span>
                                    ${value?"Activo":"Inactivo"}
                                </span>
                                `
                            }
                        `
                    },
                    {
                        field:"updated_at",
                        title:"Actualización",
                        formatter:(value)=>
                            value
                            ?
                            new Date(value)
                            .toLocaleString(
                                "es-ES",
                                {
                                    dateStyle:"short",
                                    timeStyle:"short"
                                }
                            )
                            :
                            ""
                    }
                ]
            },

            data:users,

            actions:[
                {
                    text:"Editar",
                    class:"edit",
                    onclick:"editUser"

                }

            ]

        });

    }
    catch(error){

        console.error(
            "Error cargando usuarios",
            error
        );

    }

}



/*=============================================
=               ACCIONES                      =
=============================================*/


function editUser(id){

    openUserModal(id);

}

async function openUserModal(id=null){

    if(document.getElementById("userModal"))
        return;

    const html =
        await fetch(
            "/admin/components/userModal.html"
        )
        .then(r=>r.text());

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    document
    .getElementById("userModal")
    .classList.add("show");

    await initUserForm(id);

}

function closeUserModal(){

    const modal =
        document.getElementById(
            "userModal"
        );

    if(!modal)
        return;

    modal.classList.remove("show");

    modal.remove();

}

async function toggleUserStatus(
    id,
    active,
    checkbox
){

    if(!active){

        openConfirmModal({

            title:"Desactivar usuario",

            message:
            "El usuario no podrá acceder al sistema.",

            confirmText:"Desactivar",

            confirmClass:"btn-delete",

            onConfirm:async()=>{

                await fetch(
                    `/api/adminusers/${id}/status`,
                    {
                        method:"PUT",

                        headers:{
                            "Content-Type":
                            "application/json"
                        },

                        body:JSON.stringify({

                            is_active:false

                        })

                    }
                );

                loadUsersTable();

            },

            onCancel:()=>{

                checkbox.checked=true;

            }

        });

    }
    else{

        await fetch(
            `/api/adminusers/${id}/status`,
            {

                method:"PUT",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    is_active:true

                })

            }
        );

        loadUsersTable();

    }

}

async function toggleUserConfig(
    id,
    active,
    checkbox
){

    if(!active){

        openConfirmModal({

            title:"Desactivar panel de configuración",

            message:
            "El usuario no podrá acceder al panel de configuración.",

            confirmText:"Desactivar",

            confirmClass:"btn-delete",

            onConfirm:async()=>{

                await fetch(
                    `/api/adminusers/${id}/config`,
                    {
                        method:"PUT",

                        headers:{
                            "Content-Type":
                            "application/json"
                        },

                        body:JSON.stringify({

                            is_config:false

                        })

                    }
                );

                loadUsersTable();

            },

            onCancel:()=>{

                checkbox.checked=true;

            }

        });

    }
    else{

        await fetch(
            `/api/adminusers/${id}/config`,
            {

                method:"PUT",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    is_config:true

                })

            }
        );

        loadUsersTable();

    }

}