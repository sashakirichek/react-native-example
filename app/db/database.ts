import { SQLiteDatabase } from "expo-sqlite";

export type MenuItemFromFetch = {
  id: number;
  title: string;
  price: number;
  category: {
    title: "Appetizers" | "Salads" | "Beverages";
  };
};

export type MenuItem = {
  id: number;
  title: string;
  price: number;
  category: string;
  styles: object;
};

export const sections = ["All", "Appetizers", "Salads", "Beverages"];

export type Customer = {
  id: number;
  name: string;
};

export async function getMenuItems(db: SQLiteDatabase) {
  return new Promise(async (resolve) => {
    const allRows = await db.getAllAsync<MenuItem>("SELECT * FROM menuitems");
    resolve(allRows);
  });
}
export async function clearMenuItems(db: SQLiteDatabase) {
  return new Promise(async (resolve, reject) => {
    try {
      await db.runAsync("DELETE FROM menuitems;");
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export async function saveMenuItems(db: SQLiteDatabase, menuItems: MenuItemFromFetch[]) {
  return new Promise(async (resolve) => {
    await db.withTransactionAsync(async () => {
      // use a single INSERT statement with comma-separated placeholders
      // and build a flat params array so expo-sqlite can bind them correctly.
      const placeholders = menuItems.map(() => `(?, ?, ?, ?)`).join(", ");
      const sql = `INSERT INTO menuitems (id, title, category, price) VALUES ${placeholders};`;
      const params: any[] = [];
      menuItems.forEach((menuItem) => {
        params.push(menuItem.id, menuItem.title, menuItem.category.title, menuItem.price);
      });
      await db.runAsync(sql, params);
    });

    // 2. Implement a single SQL statement to save all menu data in a table called menuitems.
    // Check the createTable() function above to see all the different columns the table has
    // Hint: You need a SQL statement to insert multiple rows at once.
  });
}

/**
 * 4. Implement a transaction that executes a SQL statement to filter the menu by 2 criteria:
 * a query string and a list of categories.
 *
 * The query string should be matched against the menu item titles to see if it's a substring.
 * For example, if there are 4 items in the database with titles: 'pizza, 'pasta', 'french fries' and 'salad'
 * the query 'a' should return 'pizza' 'pasta' and 'salad', but not 'french fries'
 * since the latter does not contain any 'a' substring anywhere in the sequence of characters.
 *
 * The activeCategories parameter represents an array of selected 'categories' from the filter component
 * All results should belong to an active category to be retrieved.
 * For instance, if 'pizza' and 'pasta' belong to the 'Main Dishes' category and 'french fries' and 'salad' to the 'Sides' category,
 * a value of ['Main Dishes'] for active categories should return  only'pizza' and 'pasta'
 *
 * Finally, the SQL statement must support filtering by both criteria at the same time.
 * That means if the query is 'a' and the active category 'Main Dishes', the SQL statement should return only 'pizza' and 'pasta'
 * 'french fries' is excluded because it's part of a different category and 'salad' is excluded due to the same reason,
 * even though the query 'a' it's a substring of 'salad', so the combination of the two filters should be linked with the AND keyword
 *
 */
export async function filterByQueryAndCategories(db: SQLiteDatabase, query: string, activeCategories: string[]) {
  return new Promise(async (resolve, reject) => {
    try {
      // if no categories are selected, we can either return all matching titles or just an empty array
      // here we'll treat it as "no results" to match UI expectations (nothing selected, nothing shown)
      if (!activeCategories || activeCategories.length === 0) {
        resolve([]);
        return;
      }

      // build SQL with IN clause for categories and LIKE for query substring
      const categoryPlaceholders = activeCategories.map(() => "?").join(", ");
      const sql = `SELECT * FROM menuitems
                   WHERE category IN (${categoryPlaceholders})
                     AND title LIKE ?;`;

      const params: any[] = [...activeCategories, `%${query?.trim()}%`];
      const rows = await db.getAllAsync<MenuItem>(sql, params);
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}
