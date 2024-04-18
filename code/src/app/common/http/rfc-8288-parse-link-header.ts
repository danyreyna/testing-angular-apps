import { isObjectLike } from "../is-object-like";

/*
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.3
 */
const OWS = "[\\t ]*";
const BWS = OWS;

/*
 * https://datatracker.ietf.org/doc/html/rfc8288#section-1.1
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.3
 */
const RWS_REGEX = /[\t ]+/;

/*
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.2
 * https://datatracker.ietf.org/doc/html/rfc8288#section-2.2
 * The names of target attributes SHOULD conform to the token rule,
 * but SHOULD NOT include any of the characters "%", "'", or "*".
 *
 * Note: `\*?` at the end is for star_param_names.
 */
const LINK_PARAM_NAME = "[!#$&+\\-.^_`|~\\dA-Za-z]+\\*?";

/*
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.2
 * https://datatracker.ietf.org/doc/html/rfc9110#section-2.1
 * Any visible US-ASCII character, except delimiters.
 */
const TOKEN = "[!#$%&'*+\\-.^_`|~\\dA-Za-z]+";

/*
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.5
 */
const OBS_TEXT = "\\x80-\\xFF";

/*
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.4
 */
const QD_TEXT = `[\\t \\x21\\x23-\\x5B\\x5D-\\x7E${OBS_TEXT}]`;

/*
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.4
 * The backslash can be used as a quoting mechanism within quoted-string and comment constructs.
 */
const QUOTED_PAIR = `\\[\\t \\x21-\\x7E${OBS_TEXT}]`;

/*
 * https://datatracker.ietf.org/doc/html/rfc9110#section-5.6.4
 */
const QUOTED_STRING = `"(?:${QD_TEXT}|${QUOTED_PAIR})*"`;
const QUOTED_STRING_REGEX = new RegExp(
  `"(?<parsedQuotedString>(?:${QD_TEXT}|${QUOTED_PAIR})*)"`,
  "i",
);

/*
 * https://datatracker.ietf.org/doc/html/rfc8288#section-3
 */
const LINK_PARAM = `${LINK_PARAM_NAME}${BWS}(?:=${BWS}(?:${TOKEN}|${QUOTED_STRING}))?`;
const LINK_PARAM_REGEX = new RegExp(
  `(?<parameterName>${LINK_PARAM_NAME})${BWS}(?:=${BWS}(?<parameterValue>${TOKEN}|${QUOTED_STRING}))?`,
  "gi",
);

/*
 * https://datatracker.ietf.org/doc/html/rfc8187#section-3.2.1
 * https://datatracker.ietf.org/doc/html/rfc8187#section-2
 */
const PCT_ENCODED = "%[\\dA-Fa-f]{2}";

/*
 * https://datatracker.ietf.org/doc/html/rfc8187#section-3.2.1
 * https://datatracker.ietf.org/doc/html/rfc8187#section-2
 * > token except ( "*" / "'" / "%" )
 */
const ATTR_CHAR = "[A-Za-z\\d!#$&+\\-.^_`|~]";

/*
 * https://datatracker.ietf.org/doc/html/rfc8187#section-3.2.1
 */
const VALUE_CHARS = `(?:${PCT_ENCODED}|${ATTR_CHAR})*`;

/*
 * https://datatracker.ietf.org/doc/html/rfc8187#section-3.2.1
 * > Producers MUST use the "UTF-8" ([RFC3629]) character encoding.
 * > Extension character encodings (mime-charset) are reserved for future use.
 */
const EXTENDED_PARAMETER_VALUES_REGEX = new RegExp(
  `UTF-8'(?<language>[^']+)?'(?<valueChars>${VALUE_CHARS})`,
  "i",
);

/*
 * https://datatracker.ietf.org/doc/html/rfc8288#section-3
 * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.2
 */
const URI_REFERENCE = "[^>]+";

/*
 * https://datatracker.ietf.org/doc/html/rfc8288#section-3
 * Regarding the trailing OWS, quoting https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.3
 * > 2.  While input has content:
 * >   10.  Append (parameter_name, parameter_value) to parameters.
 * >   11.  Consume any leading OWS.
 */
const LINK_PARAMS = `(?:${OWS};${OWS}${LINK_PARAM})*${OWS}`;

/*
 * https://datatracker.ietf.org/doc/html/rfc8288#section-3
 * Regarding the leading OWS, quoting https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.2
 * > 2.  While field_value has content:
 * >   1.   Consume any leading OWS.
 */
const LINK_VALUE = `${OWS}<${URI_REFERENCE}>${LINK_PARAMS}`;
const LINK_REGEX = new RegExp(
  `${OWS}<(?<target>${URI_REFERENCE})>(?<linkParams>${LINK_PARAMS})`,
  "gi",
);

/*
 * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.2
 * This algorithm parses zero or more comma-separated link-values from a Link header field.
 */
const LINKS_REGEX = new RegExp(`^${LINK_VALUE}(?:,${LINK_VALUE})*$`, "i");

function parseQuotedString(parameterValue: string) {
  /*
   * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.4
   */
  const match = QUOTED_STRING_REGEX.exec(parameterValue);

  return match?.groups?.["parsedQuotedString"] ?? "";
}

function decodeParameterValue(parameterValue: string) {
  /*
   * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.3
   * > If the last character of parameter_name is an asterisk ("*"),
   * > decode parameter_value according to [RFC8187].
   * > Continue processing input if an unrecoverable error is encountered.
   */
  const match = EXTENDED_PARAMETER_VALUES_REGEX.exec(parameterValue);
  if (match?.groups?.["valueChars"] === undefined) {
    return "";
  }

  const valueChars = match.groups["valueChars"];

  try {
    return globalThis.decodeURIComponent(valueChars);
  } catch {
    return "";
  }
}

type LinkMatchGroups = {
  target: string;
  linkParams: string;
};

type ParsedLinkParameter = {
  parameterName: string;
  parameterValue: null | string;
};

type ParameterName = string;
type ParameterValues = string[];
export type ParametersMap = Map<ParameterName, ParameterValues>;

function parseParameters(linkParams: LinkMatchGroups["linkParams"]) {
  /*
   * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.3
   */

  const isParsedLinkParameter = (
    groups: unknown,
  ): groups is ParsedLinkParameter => {
    if (!isObjectLike(groups)) {
      return false;
    }

    return (
      typeof groups["parameterName"] === "string" &&
      (groups["parameterValue"] === null ||
        typeof groups["parameterValue"] === "string")
    );
  };

  const getValue = (
    parameterValue: ParsedLinkParameter["parameterValue"],
    mustBeDecoded: boolean,
  ) => {
    if (parameterValue === null) {
      return "";
    }

    const value = parameterValue.startsWith(`"`)
      ? parseQuotedString(parameterValue)
      : parameterValue;

    return mustBeDecoded ? decodeParameterValue(value) : value;
  };

  return Array.from(linkParams.matchAll(LINK_PARAM_REGEX))
    .map(({ groups }) => ({
      parameterName: groups?.["parameterName"],
      parameterValue: groups?.["parameterValue"] ?? null,
    }))
    .filter(isParsedLinkParameter)
    .reduce((accumulator, { parameterName, parameterValue }) => {
      const value = getValue(parameterValue, parameterName.endsWith("*"));
      const lowercaseName = parameterName.toLowerCase();

      if (
        ["rel", "media", "title", "title*", "type", "anchor"].includes(
          lowercaseName,
        ) &&
        accumulator.has(lowercaseName)
      ) {
        return accumulator;
      }

      accumulator.set(lowercaseName, [
        ...(accumulator.get(lowercaseName) ?? []),
        value,
      ]);

      return accumulator;
    }, new Map() as ParametersMap);
}

function parseLinkFieldValue(
  { linkParams, target }: LinkMatchGroups,
  responseUrl: Response["url"],
  unsupportedInternationalisedParams?: ParameterName[],
) {
  /*
   * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.2
   */
  const linkParameters = parseParameters(linkParams);

  const targetUri = new URL(
    target,
    responseUrl === "" ? undefined : responseUrl,
  );

  const [relations] = linkParameters.get("rel") ?? [""];
  const relationTypes = relations?.split(RWS_REGEX) ?? [];

  const getContext = () => {
    const anchor = linkParameters.get("anchor");
    const contextCandidate = anchor?.[0] ?? responseUrl;

    /*
     * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.2
     * > Where the URL is anonymous, context_string is null.
     */
    if (contextCandidate === "") {
      return null;
    }

    return contextCandidate;
  };
  const context = getContext();
  const contextUri = context === null ? null : new URL(context, targetUri.href);

  const targetAttributes = Array.from(linkParameters.entries())
    .filter(([parameterName]) => !["rel", "anchor"].includes(parameterName))
    .reduce((accumulator, [parameterName, parameterValues]) => {
      if (
        ["media", "title", "title*", "type"].includes(parameterName) &&
        accumulator.has(parameterName)
      ) {
        return accumulator;
      }

      accumulator.set(parameterName, parameterValues);

      return accumulator;
    }, new Map() as ParametersMap);

  const starParamNames = Array.from(targetAttributes.keys()).filter(
    (parameterName) => parameterName.endsWith("*"),
  );
  for (const starParamName of starParamNames) {
    const baseParamName = starParamName.slice(0, -1);

    if (unsupportedInternationalisedParams?.includes(baseParamName)) {
      targetAttributes.delete(starParamName);
    } else {
      targetAttributes.delete(baseParamName);

      targetAttributes.set(
        baseParamName,
        targetAttributes.get(starParamName) ?? [],
      );
      targetAttributes.delete(starParamName);
    }
  }

  return relationTypes.map((relationType) => ({
    target: targetUri,
    context: contextUri,
    relationType,
    targetAttributes,
  }));
}

export type Link = {
  target: URL;
  context: null | URL;
  relationType: string;
  targetAttributes: ParametersMap;
};

export function parseLinkHeader(
  response: Response,
  unsupportedInternationalisedParams?: ParameterName[],
): Link[] {
  /*
   * https://datatracker.ietf.org/doc/html/rfc8288#appendix-B.1
   */
  const fieldValues = response.headers.get("link");
  if (fieldValues === null || !LINKS_REGEX.test(fieldValues)) {
    return [];
  }

  const isLinkMatchGroups = (
    groups: RegExpMatchArray["groups"],
  ): groups is LinkMatchGroups =>
    isObjectLike(groups) &&
    typeof groups["target"] === "string" &&
    typeof groups["linkParams"] === "string";

  return Array.from(fieldValues.matchAll(LINK_REGEX))
    .map(({ groups }) => groups)
    .filter(isLinkMatchGroups)
    .flatMap((groups) =>
      parseLinkFieldValue(
        groups,
        response.url,
        unsupportedInternationalisedParams,
      ),
    );
}
