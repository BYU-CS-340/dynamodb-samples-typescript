import { Visit } from "./entity/Visit";
import { DataPage } from "./entity/DataPage";
import { VisitsDAO } from "./dao/VisitsDAO";
import { VisitorDAO } from "./dao/VisitorDAO";

/**
 * Requires a 'visits' table with 'visitor', 'visit_location' and 'visit_count' attributes with
 * 'visitor' as the partition key, and a 'visitor' table with 'name', 'email', 'city' and 'state'
 * attributes with a partion key of 'name'.
 */
class Main {
  async run() {
    const visitsDao = new VisitsDAO();
    const visitorDao = new VisitorDAO();

    /**
     * Delete old items
     */
    await Promise.all([
      visitsDao.deleteVisit(new Visit("matt", "utah")),
      visitsDao.deleteVisit(new Visit("matt", "guatemala")),
      visitsDao.deleteVisit(new Visit("matt", "idaho")),
      visitsDao.deleteVisit(new Visit("matt", "italy")),
      visitsDao.deleteVisit(new Visit("elliot", "italy")),
      visitsDao.deleteVisit(new Visit("nate", "italy")),
      visitsDao.deleteVisit(new Visit("adam", "italy")),
    ]);

    /**
     * Get an Item
     */
    const count = await visitsDao.getVisitCount(new Visit("matt", "guatemala"));
    console.log(
      "(Just getting) Matt has visited Guatemala " + count + " time(s)"
    );

    /**
     * Update an item, one of which exists (guatemala), one of which is new (utah)
     */
    await visitsDao.recordVisit(new Visit("matt", "utah"));
    await visitsDao.recordVisit(new Visit("matt", "guatemala"));

    const countGuatemala = await visitsDao.getVisitCount(
      new Visit("matt", "guatemala")
    );
    console.log(
      "(After recording) Matt has visited Guatemala " +
        countGuatemala +
        " time(s)"
    );

    const countUtah: number = await visitsDao.getVisitCount(
      new Visit("matt", "utah")
    );
    console.log(
      "(After recording) Matt has visited utah " + countUtah + " time(s)"
    );

    /**
     * Delete an item
     */
    await visitsDao.deleteVisit(new Visit("matt", "utah"));
    const countUtah2 = await visitsDao.getVisitCount(new Visit("matt", "utah"));
    console.log(
      "(After deletion) Matt has visited utah " + countUtah2 + " time(s)"
    );

    /**
     * Add more items
     */
    await Promise.all([
      visitsDao.recordVisit(new Visit("matt", "idaho")),
      visitsDao.recordVisit(new Visit("matt", "italy")),
      visitsDao.recordVisit(new Visit("elliot", "italy")),
      visitsDao.recordVisit(new Visit("nate", "italy")),
      visitsDao.recordVisit(new Visit("adam", "italy")),
    ]);

    /**
     * Get the first page (lastlocation = null) of items
     */
    const page: DataPage<Visit> = await visitsDao.getVisitedLocations("matt");
    const visits: Visit[] = page.values;
    const hasMorePages = page.hasMorePages;
    console.log(
      "Matt has visited: " +
        visits +
        ", and are there more pages? " +
        hasMorePages
    );
    this.verify(hasMorePages);

    const lastLocation = visits[visits.length - 1].visit_location;

    /**
     * Get the second page (lastlocation = the last thing returned from the first page) of items
     */
    const page2: DataPage<Visit> = await visitsDao.getVisitedLocations(
      "matt",
      lastLocation
    );
    const visits2: Visit[] = page2.values;
    const hasMorePages2 = page2.hasMorePages;
    console.log(
      "Matt has also visited: " +
        visits2 +
        ", and are there more pages? " +
        hasMorePages2
    );
    this.verify(!hasMorePages2);

    /**
     * Using an Index: Get the first page (lastVisitor = null) of items
     */
    const page3: DataPage<Visit> = await visitsDao.getVisitors("italy");
    const visitsToItaly: Visit[] = page3.values;
    const hasMorePages3: boolean = page3.hasMorePages;
    console.log(
      "Italy was visited by: " +
        visitsToItaly +
        ", and are there are more pages? " +
        hasMorePages3
    );
    this.verify(hasMorePages3);

    const lastVisitor: string = visitsToItaly[visitsToItaly.length - 1].visitor;

    /**
     * Using an Index: Get the second page (lastVisitor = the last thing returned from the first page) of items
     */
    const page4: DataPage<Visit> = await visitsDao.getVisitors(
      "italy",
      lastVisitor
    );
    const visitsToItaly2: Visit[] = page4.values;
    const hasMorePages4: boolean = page4.hasMorePages;
    console.log(
      "Italy was also visited by: " +
        visitsToItaly2 +
        ", and are there are more pages? " +
        hasMorePages4
    );
    this.verify(!hasMorePages4);

    /**
     * Get multiple users using BatchGet
     */
    const visitors = await visitorDao.batchGetVisitors(["Jerod", "Emily"]);
    console.log("Retrieved visitors:");
    visitors.forEach((visitor) => console.log("\t" + visitor.toString()));
  }

  private verify(b: boolean): void {
    if (!b) {
      throw Error("Verficiation failed.");
    }
  }
}

function run() {
  new Main().run();
}

run();
