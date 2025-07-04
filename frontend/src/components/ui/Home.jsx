import React from "react";
import Feed from "./Feed";

import useGetAllPost from "@/hooks/useGetAllPost";

const Home = () => {
  useGetAllPost();
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <Feed />
      </div>
     
    </div>
  );
};

export default Home;
