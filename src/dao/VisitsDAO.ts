import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Visit } from "../entity/Visit";
import { DataPage } from "../entity/DataPage";

export class VisitsDAO {
  readonly tableName = "visit";
  readonly indexName = "visit_location-visitor-index";
  readonly visitorAttr = "visitor";
  readonly locationAttr = "visit_location"; // 'location' is a reserved keyword. A column can be named location, but then pagination cannot query using that column.
  readonly visitCountAttr = "visit_count";

  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());

  /**
   * Retrieve the number of times visitor has visited location
   *
   * @param visit
   * @return
   */
  async getVisitCount(visit: Visit): Promise<number> {
    const params = {
      TableName: this.tableName,
      Key: this.generateVisitItem(visit),
      ProjectionExpression: this.visitCountAttr, // Don't include if you want all attributes
    };
    const output = await this.client.send(new GetCommand(params));
    if (
      output.Item === undefined ||
      output.Item[this.visitCountAttr] === undefined
    ) {
      return 0;
    } else {
      return output.Item[this.visitCountAttr];
    }
  }

  /**
   * Increment the number of times visitor has visited location
   *
   * @param visit
   */
  async recordVisit(visit: Visit): Promise<void> {
    // load it if it exists
    const visitInDatabase: Visit | undefined = await this.getVisit(visit);
    if (visitInDatabase !== undefined) {
      await this.incrementVisit(visit);
    } else {
      visit.visit_count = 1;
      await this.putVisit(visit);
    }
  }

  private async putVisit(visit: Visit): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.visitorAttr]: visit.visitor,
        [this.locationAttr]: visit.visit_location,
        [this.visitCountAttr]: visit.visit_count,
      },
    };
    await this.client.send(new PutCommand(params));
  }

  private async incrementVisit(visitor: Visit): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: this.generateVisitItem(visitor),
      ExpressionAttributeValues: { ":inc": 1 },
      UpdateExpression:
        "SET " + this.visitCountAttr + " = " + this.visitCountAttr + " + :inc",
    };
    await this.client.send(new UpdateCommand(params));
  }

  private async getVisit(visit: Visit): Promise<Visit | undefined> {
    const params = {
      TableName: this.tableName,
      Key: this.generateVisitItem(visit),
    };
    const output = await this.client.send(new GetCommand(params));
    return output.Item == undefined
      ? undefined
      : new Visit(
          output.Item[this.visitorAttr],
          output.Item[this.locationAttr],
          output.Item[this.visitCountAttr]
        );
  }

  /**
   * Delete all visits of visitor to location
   *
   * @param visit
   */
  async deleteVisit(visit: Visit): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: this.generateVisitItem(visit),
    };
    await this.client.send(new DeleteCommand(params));
  }

  /**
   * Fetch the next page of locations visited by visitor
   *
   * @param visitor The visitor of interest
   * @param lastLocation The last location returned in the previous page of results
   * @param limit The maximum number of locations to include in the result
   * @return The next page of locations visited by visitor
   */
  async getVisitedLocations(
    visitor: string,
    lastLocation: string | undefined = undefined,
    limit: number = 2
  ): Promise<DataPage<Visit>> {
    const params = {
      KeyConditionExpression: this.visitorAttr + " = :v",
      ExpressionAttributeValues: {
        ":v": visitor,
      },
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey:
        lastLocation === undefined
          ? undefined
          : {
              [this.visitorAttr]: visitor,
              [this.locationAttr]: lastLocation,
            },
    };

    const items: Visit[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push(
        new Visit(
          item[this.visitorAttr],
          item[this.locationAttr],
          item[this.visitCountAttr]
        )
      )
    );
    return new DataPage<Visit>(items, hasMorePages);
  }

  /**
   * Fetch the next page of visitors who have visited location
   *
   * @param location The location of interest
   * @param lastVisitor The last visitor returned in the previous page of results
   * @param limit The maximum number of visitors to include in the result
   * @return The next page of visitors who have visited location
   */
  async getVisitors(
    location: string,
    lastVisitor: string | undefined = undefined,
    limit: number = 2
  ): Promise<DataPage<Visit>> {
    const params = {
      KeyConditionExpression: this.locationAttr + " = :loc",
      ExpressionAttributeValues: {
        ":loc": location,
      },
      TableName: this.tableName,
      IndexName: this.indexName,
      Limit: limit,
      ExclusiveStartKey:
        lastVisitor === undefined
          ? undefined
          : {
              [this.visitorAttr]: lastVisitor,
              [this.locationAttr]: location,
            },
    };

    const items: Visit[] = [];
    const data = await this.client.send(new QueryCommand(params));
    const hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push(
        new Visit(
          item[this.visitorAttr],
          item[this.locationAttr],
          item[this.visitCountAttr]
        )
      )
    );

    return new DataPage<Visit>(items, hasMorePages);
  }

  private generateVisitItem(visit: Visit) {
    return {
      [this.visitorAttr]: visit.visitor,
      [this.locationAttr]: visit.visit_location,
    };
  }
}
