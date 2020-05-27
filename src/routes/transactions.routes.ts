import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import multer from 'multer';

import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const categoriesRepository = getRepository(Category);

  const transactions = await transactionsRepository.find();

  const categoriesPromises = transactions.map(async transaction => {
    const category = await categoriesRepository.findOne({
      where: { id: transaction.category_id },
    });

    return { ...transaction, category };
  });

  const transactionsWithCategory = await Promise.all(categoriesPromises);

  const balance = await transactionsRepository.getBalance();

  return response.json({
    transactions: transactionsWithCategory,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
