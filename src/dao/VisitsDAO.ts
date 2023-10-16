import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ClientDynamo";
import { Visit } from "../entity/Visit";
import { DataPage } from "../entity/DataPage";

export class VisitsDAO {
  readonly TableName = "visit";
  readonly IndexName = "visit_location-visitor-index";
  readonly VisitorAttr = "visitor";
  readonly LocationAttr = "visit_location"; // 'location' is a reserved keyword. A column can be named location, but then pagination cannot query using that column.
  readonly VisitCountAttr = "visit_count";

  /**
   * Retrieve the number of times visitor has visited location
   *
   * @param visit
   * @return
   */
  async getVisitCount(visit: Visit): Promise<number> {
    let params = {
      TableName: this.TableName,
      Key: this.generateVisitItem(visit),
      ProjectionExpression: this.VisitCountAttr,
    };
    let output = await ddbDocClient.send(new GetCommand(params));
    if (
      output.Item === undefined ||
      output.Item[this.VisitCountAttr] === undefined
    ) {
      return 0;
    } else {
      return output.Item[this.VisitCountAttr];
    }
  }

  /**
   * Increment the number of times visitor has visited location
   *
   * @param visit
   */
  async recordVisit(visit: Visit): Promise<void> {
    // load it if it exists
    let visitInDatabase: Visit | undefined = await this.getVisit(visit);
    if (visitInDatabase !== undefined) {
      await this.incrementVisit(visit);
    } else {
      visit.visit_count = 1;
      await this.putVisit(visit);
    }
  }

  private async putVisit(visit: Visit): Promise<void> {
    const params = {
      TableName: this.TableName,
      Item: {
        [this.VisitorAttr]: visit.visitor,
        [this.LocationAttr]: visit.visit_location,
        [this.VisitCountAttr]: visit.visit_count,
      },
    };
    await ddbDocClient.send(new PutCommand(params));
  }

  private async incrementVisit(visitor: Visit): Promise<void> {
    const params = {
      TableName: this.TableName,
      Key: this.generateVisitItem(visitor),
      ExpressionAttributeValues: { ":inc": 1 },
      UpdateExpression:
        "SET " + this.VisitCountAttr + " = " + this.VisitCountAttr + " + :inc",
    };
    await ddbDocClient.send(new UpdateCommand(params));
  }

  private async getVisit(visit: Visit): Promise<Visit | undefined> {
    let params = {
      TableName: this.TableName,
      Key: this.generateVisitItem(visit),
    };
    let output = await ddbDocClient.send(new GetCommand(params));
    return output.Item == undefined
      ? undefined
      : new Visit(
          output.Item[this.VisitorAttr],
          output.Item[this.LocationAttr],
          output.Item[this.VisitCountAttr]
        );
  }

  /**
   * Delete all visits of visitor to location
   *
   * @param visit
   */
  async deleteVisit(visit: Visit): Promise<void> {
    let params = {
      TableName: this.TableName,
      Key: this.generateVisitItem(visit),
    };
    await ddbDocClient.send(new DeleteCommand(params));
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
    let params = {
      KeyConditionExpression: this.VisitorAttr + " = :v",
      ExpressionAttributeValues: {
        ":v": visitor,
      },
      TableName: this.TableName,
      Limit: limit,
      ExclusiveStartKey:
        lastLocation === undefined
          ? undefined
          : {
              [this.VisitorAttr]: visitor,
              [this.LocationAttr]: lastLocation,
            },
    };

    let items: Visit[] = [];
    let data = await ddbDocClient.send(new QueryCommand(params));
    let hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push(
        new Visit(
          item[this.VisitorAttr],
          item[this.LocationAttr],
          item[this.VisitCountAttr]
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
    let params = {
      KeyConditionExpression: this.LocationAttr + " = :loc",
      ExpressionAttributeValues: {
        ":loc": location,
      },
      TableName: this.TableName,
      IndexName: this.IndexName,
      Limit: limit,
      ExclusiveStartKey:
        lastVisitor === undefined
          ? undefined
          : {
              [this.VisitorAttr]: lastVisitor,
              [this.LocationAttr]: location,
            },
    };

    let items: Visit[] = [];
    let data = await ddbDocClient.send(new QueryCommand(params));
    let hasMorePages = data.LastEvaluatedKey !== undefined;
    data.Items?.forEach((item) =>
      items.push(
        new Visit(
          item[this.VisitorAttr],
          item[this.LocationAttr],
          item[this.VisitCountAttr]
        )
      )
    );

    return new DataPage<Visit>(items, hasMorePages);
  }

  private generateVisitItem(visit: Visit) {
    return {
      [this.VisitorAttr]: visit.visitor,
      [this.LocationAttr]: visit.visit_location,
    };
  }
}
