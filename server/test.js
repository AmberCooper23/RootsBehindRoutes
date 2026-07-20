import { createUser, getUser } from "../server/services/usersService.js";

async function run() {
  const uid = "testUser123";
  await createUser(uid, { name: "AmberTest", interests: ["restaurants"] });
  const user = await getUser(uid);
  console.log(user);
}

run();
  