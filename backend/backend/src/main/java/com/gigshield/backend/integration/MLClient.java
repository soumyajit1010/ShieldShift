package com.gigshield.backend.integration;

import com.gigshield.backend.dto.request.*;
import com.gigshield.backend.dto.response.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class MLClient {

    @Autowired
    private RestTemplate restTemplate;

    private final String BASE_URL = "http://localhost:5000/ml";

    public SeverityResponse getSeverity(
            SeverityRequest request) {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON);

        System.out.println(
                "Sending Severity Request: "
                        + request
        );

        HttpEntity<SeverityRequest> entity =
                new HttpEntity<>(
                        request,
                        headers);

        ResponseEntity<SeverityResponse> response =
                restTemplate.postForEntity(
                        BASE_URL + "/severity",
                        entity,
                        SeverityResponse.class);

        System.out.println(
                "Received ML Response: "
                        + response.getBody()
        );

        return response.getBody();
    }

    public LossResponse getLoss(
            LossRequest request) {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON);

        HttpEntity<LossRequest> entity =
                new HttpEntity<>(
                        request,
                        headers);

        ResponseEntity<LossResponse> response =
                restTemplate.postForEntity(
                        BASE_URL + "/forecast",
                        entity,
                        LossResponse.class);

        return response.getBody();
    }

    public PremiumResponse predictPremium(
            PremiumRequest request
    ) {

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );


        HttpEntity<PremiumRequest> entity =
                new HttpEntity<>(
                        request,
                        headers
                );


        ResponseEntity<PremiumResponse> response =
                restTemplate.postForEntity(
                        "http://localhost:5000/predict/premium",
                        entity,
                        PremiumResponse.class
                );


        return response.getBody();

    }

    public FraudResponse getFraud(
            FraudRequest request) {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON);

        HttpEntity<FraudRequest> entity =
                new HttpEntity<>(
                        request,
                        headers);

        ResponseEntity<FraudResponse> response =
                restTemplate.postForEntity(
                        BASE_URL + "/fraud",
                        entity,
                        FraudResponse.class);

        return response.getBody();
    }


    public DashboardRiskResponse getDashboardRisk(
            DashboardRiskRequest request) {

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON);

        HttpEntity<DashboardRiskRequest> entity =
                new HttpEntity<>(
                        request,
                        headers);

        ResponseEntity<DashboardRiskResponse> response =
                restTemplate.postForEntity(
                        BASE_URL + "/dashboard-risk",
                        entity,
                        DashboardRiskResponse.class);

        return response.getBody();
    }



    public ImagePredictionResponse getRoadPrediction(
            MultipartFile image
    ) throws IOException {


        String url = "http://localhost:5000/predict/curfew";


        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.MULTIPART_FORM_DATA
        );


        ByteArrayResource fileResource =
                new ByteArrayResource(
                        image.getBytes()
                ) {

                    @Override
                    public String getFilename() {

                        return image.getOriginalFilename();

                    }

                };



        MultiValueMap<String,Object> body =
                new LinkedMultiValueMap<>();


        body.add(
                "image",
                fileResource
        );



        HttpEntity<MultiValueMap<String,Object>> request =
                new HttpEntity<>(
                        body,
                        headers
                );



        ResponseEntity<ImagePredictionResponse> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        ImagePredictionResponse.class
                );


        return response.getBody();

    }


}