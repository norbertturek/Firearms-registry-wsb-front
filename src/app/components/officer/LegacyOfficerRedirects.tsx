import { Navigate, useLocation, useParams } from "react-router";

export function LegacyOfficerCitizenRedirect() {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={`/officer/citizens/${id}${location.search}`} replace />;
}

export function LegacyOfficerAttachmentRedirect() {
  const { applicationId, attachmentId } = useParams();
  const location = useLocation();
  return (
    <Navigate
      to={`/officer/attachments/${applicationId}/${attachmentId}${location.search}`}
      replace
    />
  );
}
