import { useSearchParams } from "react-router-dom";
import UpgradePrompt from "../../components/UpgradePrompt";
import { getUser } from "../../utils/auth";

const UpgradePromptPage = () => {
  const [searchParams] = useSearchParams();
  const user = getUser();

  const feature = searchParams.get("feature") || "Tính năng nâng cao";
  const requiredPlanStr = searchParams.get("requiredPlan") || "PAID,PREMIUM";
  const requiredPlan = requiredPlanStr.split(",");
  const currentPlan = user?.subscriptionPlan || "FREE";

  return (
    <UpgradePrompt
      feature={feature}
      requiredPlan={requiredPlan}
      currentPlan={currentPlan}
    />
  );
};

export default UpgradePromptPage;
