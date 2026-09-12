import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PolishedResumeData } from "@/agent/resume-generator";

const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 2,
    textTransform: "uppercase",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 4,
  },
  contactItem: {
    fontSize: 8.5,
    color: "#475569",
    marginRight: 10,
  },
  contactSeparator: {
    fontSize: 8.5,
    color: "#cbd5e1",
    marginRight: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: "#334155",
  },
  experienceItem: {
    marginBottom: 6,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  roleTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  },
  companyName: {
    fontSize: 9,
    color: "#2563eb",
  },
  dateLocation: {
    fontSize: 8,
    color: "#64748b",
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 2,
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 8,
    fontSize: 8,
    color: "#64748b",
  },
  bulletText: {
    flex: 1,
    fontSize: 8.2,
    lineHeight: 1.3,
    color: "#334155",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillPill: {
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 7.8,
    color: "#334155",
    fontWeight: "bold",
  },
  educationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  educationDegree: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  educationSchool: {
    fontSize: 8.5,
    color: "#475569",
  },
  educationYear: {
    fontSize: 8,
    color: "#64748b",
  },
});

interface ResumePdfDocumentProps {
  data: PolishedResumeData;
}

export function ResumePdfDocument({ data }: ResumePdfDocumentProps) {
  const { full_name, current_title, contact, summary, skills, work_experience, education } = data;

  const contactItems: string[] = [];
  if (contact.email) contactItems.push(contact.email);
  if (contact.phone) contactItems.push(contact.phone);
  if (contact.location) contactItems.push(contact.location);
  if (contact.linkedin_url) contactItems.push(contact.linkedin_url.replace(/^https?:\/\/(www\.)?/, ""));
  if (contact.portfolio_url) contactItems.push(contact.portfolio_url.replace(/^https?:\/\/(www\.)?/, ""));

  return (
    <Document title={`${full_name} - Resume`} author={full_name}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{full_name}</Text>
          <Text style={styles.title}>{current_title}</Text>
          
          <View style={styles.contactRow}>
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <Text style={styles.contactItem}>{item}</Text>
                {idx < contactItems.length - 1 && (
                  <Text style={styles.contactSeparator}>•</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Professional Summary */}
        {summary ? (
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {summary && work_experience.length > 0 ? <View style={styles.divider} /> : null}

        {/* Work Experience */}
        {work_experience && work_experience.length > 0 && (
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {work_experience.slice(0, 4).map((role, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.roleTitle}>
                    {role.job_title} <Text style={styles.companyName}>| {role.company}</Text>
                  </Text>
                  <Text style={styles.dateLocation}>
                    {role.start_date} – {role.end_date}
                  </Text>
                </View>

                {role.bullets?.map((bullet, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {work_experience.length > 0 && skills.length > 0 ? <View style={styles.divider} /> : null}

        {/* Core Skills */}
        {skills && skills.length > 0 && (
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.sectionTitle}>Technical & Core Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, sIdx) => (
                <View key={sIdx} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(skills.length > 0 || work_experience.length > 0) && education?.highest_degree ? (
          <View style={styles.divider} />
        ) : null}

        {/* Education */}
        {education?.highest_degree && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.educationItem}>
              <Text style={styles.educationDegree}>
                {education.highest_degree}
                {education.field_of_study ? ` in ${education.field_of_study}` : ""}
                {education.institution ? (
                  <Text style={styles.educationSchool}> — {education.institution}</Text>
                ) : null}
              </Text>
              {education.graduation_year ? (
                <Text style={styles.educationYear}>{education.graduation_year}</Text>
              ) : null}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
