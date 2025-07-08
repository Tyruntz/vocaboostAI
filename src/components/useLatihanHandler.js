import { useState, useCallback } from "react";

export const useLatihanHandler = () => {
   const [showHasilLatihan, setShowHasilLatihan] = useState(false);
   const [showSoalLatihan, setShowSoalLatihan] = useState(false);
   const [showDetailLatihan, setShowDetailLatihan] = useState(false);
   const [selectedSessionIdForDetail, setSelectedSessionIdForDetail] = useState(null);
   const [selectedExerciseTopicId, setSelectedExerciseTopicId] = useState(null);

   const handleShowHasilLatihan = useCallback(() => {
      setShowHasilLatihan(true);
      setShowDetailLatihan(false);
   }, []);

   const handleBackToLearn = useCallback(() => {
      setShowHasilLatihan(false);
      setShowSoalLatihan(false);
      setShowDetailLatihan(false);
      setSelectedExerciseTopicId(null);
      setSelectedSessionIdForDetail(null);
   }, []);

   const handleViewDetailedResults = useCallback((sessionId) => {
      setSelectedSessionIdForDetail(sessionId);
      setShowDetailLatihan(true);
      setShowSoalLatihan(false);
      setShowHasilLatihan(false);
   }, []);

   const handleBackToResultsList = useCallback(() => {
      setShowDetailLatihan(false);
      setShowHasilLatihan(true);
      setSelectedSessionIdForDetail(null);
   }, []);

   const handleStartExercise = useCallback((topicId) => {
      setShowSoalLatihan(true);
      setSelectedExerciseTopicId(topicId);
      setShowHasilLatihan(false);
      setShowDetailLatihan(false);
   }, []);

   return {
      showHasilLatihan,
      showSoalLatihan,
      showDetailLatihan,
      selectedSessionIdForDetail,
      selectedExerciseTopicId,
      handleShowHasilLatihan,
      handleBackToLearn,
      handleViewDetailedResults,
      handleBackToResultsList,
      handleStartExercise,
   };
};
