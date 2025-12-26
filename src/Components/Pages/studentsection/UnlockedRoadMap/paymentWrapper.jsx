import React from 'react';
import RazorpayPayment from './payment';
import useRoadmapStore from '../../../../../zustore/Roadmapstore';

const RazorpayPaymentWrapper = () => {
  const { roadmapId, roadmapTitle, amount } = useRoadmapStore();

  return (
    <RazorpayPayment
      roadmapId={roadmapId}
      amount={amount}
      roadmapTitle={roadmapTitle}
    />
  );
};

export default RazorpayPaymentWrapper;
