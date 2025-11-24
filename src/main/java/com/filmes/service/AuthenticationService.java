package com.filmes.service;

import java.text.ParseException;
import java.util.Date;
import java.util.HashSet;
import java.util.StringJoiner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.filmes.repository.UserRepository;
import com.filmes.dto.request.AuthenticationRequest;
import com.filmes.dto.request.IntrospectRequest;
import com.filmes.dto.response.AuthenticationResponse;
import com.filmes.dto.response.IntrospectResponse;
import com.filmes.enums.Role;
import com.filmes.exception.AppException;
import com.filmes.exception.ErrorCode;
import com.filmes.model.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthenticationService {
    @Autowired
    UserRepository userRepository;

    @Value("${jwt.signerKey}")
    private String secretKey;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findUserByUsername(request.getUsername());

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        boolean isAuthenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!isAuthenticated) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED);
        }

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .authenticated(isAuthenticated)
                .token(token)
                .build();
    }

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();

        JWSVerifier verifier = new MACVerifier(secretKey.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expiryDate = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);

        return IntrospectResponse.builder()
                .valid(verified && expiryDate.after(new Date()))
                .build();
    }

    String generateToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        HashSet<String> roles = new HashSet<>();
        roles.addAll(user.getRoles());

        JWTClaimsSet claimsBuilder = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("lmaook")
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + 3600000))
                .claim("scope", buildScope(user))
                .build();

        JWSObject jwsObject = new JWSObject(jwsHeader, claimsBuilder.toPayload());

        try {
            jwsObject.sign(new MACSigner(secretKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!user.getRoles().isEmpty()) {
            user.getRoles().forEach(stringJoiner::add);
        }
        return stringJoiner.toString();
    }
}