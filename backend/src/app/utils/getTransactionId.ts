const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

export default getTransactionId;
