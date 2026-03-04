import * as SQLite from "expo-sqlite";

export type MenuItem = {
  id: number;
  title: string;
  price: number;
  category: {
    title: "Appetizers" | "Salads" | "Beverages";
  };
};

export type Customer = {
  id: number;
  name: string;
};

// export const getDishes = (successCallback) => {
//   db.transaction((tx) => {
//     tx.executeSql("select * from menu", [], (_, { rows: { _array } }) => {
//       successCallback(_array);
//     });
//   });
// };

// export const insertDish = (dishName) => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql("insert into menu (name) values (?)", [dishName]);
//       },
//       reject,
//       resolve,
//     );
//   });
// };

// export const updateDish = async (dishId, newName) => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql(`update menu set name=? where uid=${dishId}`, [newName]);
//       },
//       reject,
//       resolve,
//     );
//   });
// };

// export const deleteDish = async (dishId) => {
//   return new Promise((resolve, reject) => {
//     db.transaction(
//       (tx) => {
//         tx.executeSql("delete from menu where id = ?", [dishId]);
//       },
//       reject,
//       resolve,
//     );
//   });
// };
