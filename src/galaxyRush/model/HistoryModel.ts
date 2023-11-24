import { GameOrderHistoryDTO } from "../interface/GameOrderHistory";
import SQL from "sql-template-strings";
import Model from "../../connector/models/classes/Model";

export default class GameOrderHistory extends Model {

  async createGROrderHistory(dto: GameOrderHistoryDTO): Promise<void> {
    try {
      this.connection.writerQuery(SQL`
      INSERT INTO GameGROrderHistory
        (id, userId, amount, entryPrice, exitPrice, OutType, raw)
      VALUES
        (
          ${dto.id},
          ${dto.userId},
          ${dto.amount},
          ${dto.entryPrice},
          ${dto.exitPrice},
          ${dto.outType},
          ${JSON.stringify(dto.raw)}
        )
      `)
    } catch (e) {
      console.error('order history', e)
    }
  }
}
