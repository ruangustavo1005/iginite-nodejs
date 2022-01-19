const { request, response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const customers = [];

const app = express();

app.use(express.json());

function accountExistsByCpf(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((existentCustomer => {
    return existentCustomer.cpf == cpf;
  }));

  if (!customer) {
    return response.status(400).json({
      "message": "Customer not exists"
    });
  }

  request.customer = customer;

  return next();
}

function getBalance(statements) {
  return statements.reduce((sum, statement) => {
    return sum + (statement.type == "credit" ? statement.amount : statement.amount * -1);
  }, 0);
}

/**
 * CPF: string
 * Name: string
 * Id: uuid
 * Statement: array
 */
app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const existentCustomer = customers.some((customer) => {
    return customer.cpf == cpf;
  });

  if (!!existentCustomer) {
    return response.status(400).json({
      "message": "Customer already exists"
    });
  }

  const id = uuidv4();

  const customer = {
    id,
    cpf,
    name,
    statement: []
  };

  customers.push(customer);
  
  return response.status(201).json(customer);
});

app.use(accountExistsByCpf);

app.get("/statement", (request, response) => {
  return response.status(200).json(request.customer.statement);
});

app.post("/deposit", (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    id: uuidv4(),
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).json({
    statementOperation
  });
});

app.post("/withdraw", (request, response) => {
  const { amount } = request.body;

  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (amount > balance) {
    return response.status(400).json({
      "message": "Insufficient founds"
    });
  }

  const statementOperation = {
    id: uuidv4(),
    amount,
    created_at: new Date(),
    type: "debit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).json(statementOperation);
});

app.get("/statement/date", (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(`${date} 00:00`);

  const statement = customer.statement.filter((statement) => {
    return statement.created_at.toDateString() == dateFormat.toDateString();
  });

  return response.json(statement);
});

app.put("/account", (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).json(customer);
});

app.get("/account", (request, response) => {
  return response.json(request.customer);
});

app.delete("/account", (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.json(customer);
});

app.get("/balance", (request, response) => {
  const { customer } = request;
  return response.json({
    amount: getBalance(customer.statement)
  });
});

app.listen(3333);