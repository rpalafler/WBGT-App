import React, { useEffect, useState } from "react";
import { fetchSampleData } from "../services/api";

const WBGTData = () => {
  const [data, setData] = useState(null);
  //   Aqui definimos la función para que no tenga que ser definida cada vez que se ejecuta el useEffect()
  const getData = async () => {
    const result = await fetchSampleData();
    setData(result);
  };

  useEffect(() => {
    getData();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>WBGT Sample Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default WBGTData;
