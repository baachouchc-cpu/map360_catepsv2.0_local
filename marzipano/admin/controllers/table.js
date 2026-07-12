class DataTable {

    constructor(config) {

        this.container = document.querySelector(config.container);
        this.columns = config.columns;
        this.data = config.data || [];
        this.filteredData = [...this.data]; 
        this.actions = config.actions || [];
        
        this.idField = config.idField || "id";

        this.rowsPerLoad = config.rowsPerLoad || 30;
        this.currentRows = this.rowsPerLoad;

        this.render();

    }

    render() {

        this.container.innerHTML = `
            <div class="table-container">

                <div class="table-header">

                    <h3>${this.columns.title || "Listado"}</h3>

                    <div class="table-tools">

                        <div class="search-box">

                            <input
                                type="text"
                                id="tableSearch"
                                placeholder="Buscar..."
                            >

                            <button
                                type="button"
                                id="clearSearch"
                                class="search-clear"
                                title="Limpiar búsqueda"
                            >
                                ×
                            </button>

                        </div>

                    </div>

                </div>

                <div class="table-scroll" id="tableScroll">

                    <table>

                        <thead>
                            <tr>
                                ${this.columns.fields.map(c =>
                                    `<th>${c.title}</th>`
                                ).join("")}

                                ${this.actions.length ? "<th>Acciones</th>" : ""}
                            </tr>
                        </thead>

                        <tbody id="tableBody">

                        </tbody>

                    </table>

                </div>

            </div>
        `;

        this.renderRows();

        const search = document.getElementById("tableSearch");
        const clear = document.getElementById("clearSearch");
        const scroll = document.getElementById("tableScroll");

        search.addEventListener("input", e => {

            const value = e.target.value;

            clear.style.display = value ? "flex" : "none";

            this.search(value);

        });

        clear.addEventListener("click", () => {

            search.value = "";

            clear.style.display = "none";

            this.search("");

            search.focus();

        });

        scroll.addEventListener("scroll", () => {

            this.onScroll();

        });

    }

    renderRows() {

        const tbody = document.getElementById("tableBody");

        tbody.innerHTML = "";

        const rows = this.filteredData || [];

        rows
            .slice(0, this.currentRows)
            .forEach(row => {

                const tr = document.createElement("tr");

                tr.innerHTML = `

                    ${this.columns.fields.map(col =>

                        `<td>
                            ${
                                col.formatter
                                    ? col.formatter(row[col.field], row)
                                    : (row[col.field] ?? "")
                            }
                        </td>`

                    ).join("")}

                    ${this.actions.length ? `
                        <td class="actions">

                            ${this.actions.map(action => `

                                <button
                                    class="${action.class}"
                                    data-id="${row[this.idField]}"
                                    onclick="${action.onclick}(${row[this.idField]})"
                                >

                                    ${action.text}

                                </button>

                            `).join("")}

                        </td>
                    ` : ""}

                `;

                tbody.appendChild(tr);

            });

    }

    search(text) {

        text = text.toLowerCase();

        this.filteredData = this.data.filter(row =>

            Object.values(row).some(value =>

                String(value)
                    .toLowerCase()
                    .includes(text)

            )

        );

        this.currentRows = this.rowsPerLoad;

        this.renderRows();

    }

    onScroll() {
        
        const scroll = document.getElementById("tableScroll");

        if (

            scroll.scrollTop + scroll.clientHeight >=
            scroll.scrollHeight - 20

        ) {
            
            if (this.currentRows < this.filteredData.length) {

                this.currentRows += this.rowsPerLoad;

                this.renderRows();

            }

        }

    }

    setData(data) {

        this.data = data;

        this.filteredData = [...data];

        this.currentRows = this.rowsPerLoad;

        this.renderRows();

    }

}