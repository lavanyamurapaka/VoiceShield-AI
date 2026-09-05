"""
VoiceShield AI - Abstract Base Model Interface
AI-Powered Voice Impersonation Prevention
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import numpy as np


class VoiceDetectionModel(ABC):
    """
    Abstract architecture for voice deepfake detection and speaker verification.
    Ensures modularity: ProductionModelAdapter and DevelopmentModelAdapter implement
    the exact same interface without altering downstream Spring Boot or UI layers.
    """

    @abstractmethod
    def analyze(
        self,
        audio: np.ndarray,
        sr: int,
        reference_embedding: Optional[List[float]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes acoustic and model inference on preprocessed audio samples.
        Returns detection probabilities, raw metrics, classification, and signal breakdown.
        """
        pass

    @abstractmethod
    def extract_embedding(self, audio: np.ndarray, sr: int) -> List[float]:
        """
        Extracts high-dimensional speaker representation embedding.
        """
        pass

    @abstractmethod
    def verify(
        self,
        audio: np.ndarray,
        reference_embedding: List[float],
        expected_phrase: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verifies audio against an enrolled reference embedding and optional challenge phrase.
        """
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """
        Returns model metadata, adapter type, validation status, and supported features.
        """
        pass
