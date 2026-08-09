package com.gigshield.backend.controller;


import com.gigshield.backend.dto.request.ClaimRequest;
import com.gigshield.backend.dto.response.ClaimHistoryResponse;
import com.gigshield.backend.dto.response.ClaimResponse;
import com.gigshield.backend.dto.response.ImagePredictionResponse;
import com.gigshield.backend.integration.MLClient;
import com.gigshield.backend.service.ClaimService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@RestController
@RequestMapping("/api/claims")
public class ClaimController {


    @Autowired
    private ClaimService claimService;


    @Autowired
    private MLClient mlClient;



    /*
     * Submit Claim
     *
     * Receives:
     * workerId
     * policyId
     * eventId
     * description
     * image evidence
     */
    @PostMapping(
            value = "/process",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ClaimResponse processClaim(

            @RequestParam("workerId")
            Long workerId,


            @RequestParam("policyId")
            Long policyId,


            @RequestParam("eventId")
            Long eventId,


            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,


            @RequestPart(
                    value = "image",
                    required = false
            )
            MultipartFile image

    ) {


        ClaimRequest request = new ClaimRequest();


        request.setWorkerId(workerId);

        request.setPolicyId(policyId);

        request.setEventId(eventId);

        request.setDescription(description);

        request.setImage(image);



        return claimService.processClaim(
                request,
                image
        );
    }





    /*
     * Claim History
     */
    @GetMapping("/worker/{workerId}")
    public List<ClaimHistoryResponse> getWorkerClaims(

            @PathVariable Long workerId

    ) {

        return claimService.getWorkerClaims(workerId);

    }





    /*
     * Temporary testing endpoint
     *
     * React/Backend image upload
     *          |
     *          ↓
     * Spring Boot
     *          |
     *          ↓
     * Flask /predict/curfew
     *
     */
    @PostMapping(
            value = "/test-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ImagePredictionResponse testImage(

            @RequestParam("image")
            MultipartFile image

    ) throws IOException {


        return mlClient.getRoadPrediction(image);

    }


}