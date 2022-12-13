function cod(req, res) {
  try {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const dia = data.getDate();
    const hora = data.getHours();
    const minuto = data.getMinutes();
    const segundo = data.getSeconds();
    const milesegundos = data.getMilliseconds();
    const result = Number(
      parseFloat(
        Number(
          ano +
            "" +
            mes +
            "" +
            dia +
            "" +
            hora +
            "" +
            minuto +
            "" +
            segundo +
            "" +
            milesegundos
        ) / 2
      ).toFixed(0)
    );
    return  result;
  } catch (error) {}
  return 0;
}

  
  export default cod;