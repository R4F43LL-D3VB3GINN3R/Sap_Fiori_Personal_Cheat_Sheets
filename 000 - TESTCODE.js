sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",            // Importa o filtro
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (JSONModel, Controller, Filter, FilterOperator, MessageBox) {
    "use strict";

    return Controller.extend("sbx.pt.cockpitorders.controller.cockpit_orders", {

        onInit: function () {

            var oView = this.getView();

            // Inicializa o json model de procura por range de data
            var oFModelRange = new sap.ui.model.json.JSONModel();
            oFModelRange.setData({
                "Aedat1": "",                                // Filtro por Data de Entrada do documento (início)
                "Aedat2": ""                                 // Filtro por Data de Entrada do documento (fim)
            });

            oView.setModel(oFModelRange, "filterRange");

        },

        // Formatter para formatação de data
        formatDate: function (sDate) {
            if (!sDate) return "";
            var oDate = new Date(sDate);
            var year = oDate.getFullYear();
            var month = String(oDate.getMonth() + 1).padStart(2, "0"); // Adiciona zero à esquerda
            var day = String(oDate.getDate()).padStart(2, "0");        // Adiciona zero à esquerda
            return year + month + day; // Formato yyyymmdd
        },

        onSearch: function () {

            var oView = this.getView();
            var oTable = oView.byId("ordersTable");
            var oFModelRange = oView.getModel("filterRange");
            var oFRangeData = oFModelRange.getData();

            // Inicializa os filtros
            var aFilters = [];

            // Verifica se os dois campos estão vazios
            if (!oFRangeData.Aedat1 && !oFRangeData.Aedat2) {
                // Ambos os campos estão vazios, chama o serviço sem filtros
                oTable.bindItems({
                    path: "/ORDERSSet",
                    filters: aFilters, // Filtro vazio
                    template: new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: "{Ebeln}" }),
                            new sap.m.Text({ text: "{Ekgrp}" }),
                            new sap.m.Text({ text: "{Aedat}" }),
                            new sap.m.Text({ text: "{Lastchangedatetime}" })
                        ]
                    })
                });
                return; // Termina a execução da função

            } else if (oFRangeData.Aedat1 >= oFRangeData.Aedat2) {

                MessageBox.information("A data inicial deve ser menor que a data final");
                return;

            }

            // Verifica se ambos os campos de data estão preenchidos (Aedat1 e Aedat2)
            if (oFRangeData.Aedat1 && oFRangeData.Aedat2) {

                // Formata as datas para o formato yyyyMMdd
                var formattedDateStart = this.formatDate(oFRangeData.Aedat1);
                var formattedDateEnd   = this.formatDate(oFRangeData.Aedat2);

                // Adiciona o filtro por intervalo de datas (Aedat1 a Aedat2)
                var oRangeFilter = new Filter({
                    path: "Aedat",
                    operator: FilterOperator.BT,
                    value1: formattedDateStart,
                    value2: formattedDateEnd
                });
                aFilters.push(oRangeFilter);
                
            } else if (!oFRangeData.Aedat1 && oFRangeData.Aedat2) {

                MessageBox.information("Preencha a data inicial");
                return;

            } else {
                // Se o campo Aedat for preenchido, aplica o filtro por data única
                var formattedDate = this.formatDate(oFRangeData.Aedat1);

                var oFilter = new Filter({
                    path: "Aedat",
                    operator: FilterOperator.EQ,
                    value1: formattedDate
                });

                aFilters.push(oFilter);
            }

            // Atualiza a tabela com os filtros aplicados
            oTable.bindItems({
                path: "/ORDERSSet",
                filters: aFilters,
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: "{Ebeln}" }),
                        new sap.m.Text({ text: "{Ekgrp}" }),
                        new sap.m.Text({ text: "{Aedat}" }),
                        new sap.m.Text({ text: "{Lastchangedatetime}" })
                    ]
                })
            });
        }
    });
});
