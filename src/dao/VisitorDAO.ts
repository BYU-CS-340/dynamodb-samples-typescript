import {
  BatchGetCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Visitor } from "../entity/Visitor";

export class VisitorDAO {
  readonly tableName = "visitor";
  readonly nameAttr = "name";
  readonly emailAttr = "email";
  readonly cityAttr = "city";
  readonly stateAttr = "state";

  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  /**
   * Retrieve the specified users
   *
   * @param visit
   * @return
   */
  async batchGetVisitors(visitorNames: string[]): Promise<Visitor[]> {
    if (visitorNames && visitorNames.length > 0) {
      // Deduplicate the names (only necessary if used in cases where there can be duplicates)
      const namesWithoutDuplicates = [...new Set(visitorNames)];

      const keys = namesWithoutDuplicates.map<Record<string, {}>>((name) => ({
        [this.nameAttr]: name,
      }));

      const params = {
        RequestItems: {
          [this.tableName]: {
            Keys: keys,
          },
        },
      };

      const result = await this.client.send(new BatchGetCommand(params));

      if (result.Responses) {
        return result.Responses[this.tableName].map<Visitor>(
          (item) =>
            new Visitor(
              item[this.nameAttr],
              item[this.emailAttr],
              item[this.cityAttr],
              item[this.stateAttr]
            )
        );
      }
    }

    return [];
  }
}
