const express = require("express");

const app = express();

app.use(express.json());

app.get("/courses", (request, response) => {
  return response.json({
    message: "Hello, world!!!"
  });
});

/**
 * route param -> buscar, alterar e excluir (normalmente id) | OBRIGATÓRIO
 * query param -> opções/filtros | opcional
 * body -> objetos com dados para manipulação
 */
app.get("/courses/:id", (request, response) => {
  const { id } = request.params;
  return response.json({ value : id * 2 });
});

app.listen(3333);