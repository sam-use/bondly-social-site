import React from "react";
import Feed from "./Feed";

import useGetAllPost from "@/hooks/useGetAllPost";

const Home = () => {
  useGetAllPost();
  return <Feed />;
};

export default Home;
