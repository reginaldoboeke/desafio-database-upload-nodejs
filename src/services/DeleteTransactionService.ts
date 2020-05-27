import { getCustomRepository } from 'typeorm';
import { isUuid } from 'uuidv4';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const isValid = isUuid(id);

    if (!isValid) {
      throw new AppError('The id entered is invalid.');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction does not exist.');
    }

    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
