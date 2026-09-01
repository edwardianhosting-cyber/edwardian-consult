import Link from 'next/link';
import { GraduationCap, Award, Users, BookOpen, Target, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Edwardian Educational Consult</h1>
          <p className="text-xl text-primary-200 max-w-3xl mx-auto">
            Empowering students to achieve their academic dreams through innovative learning solutions
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At Edwardian Educational Consult, we are dedicated to providing world-class educational 
                preparation services that equip students with the knowledge, skills, and confidence needed 
                to excel in their academic pursuits.
              </p>
              <p className="text-gray-600 mb-4">
                Our comprehensive approach combines cutting-edge technology with proven teaching methodologies 
                to deliver personalized learning experiences for every student.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">5000+</p>
                  <p className="text-sm text-gray-500">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">95%</p>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">10+</p>
                  <p className="text-sm text-gray-500">Years Experience</p>
                </div>
              </div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 text-center">
                  <GraduationCap className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">JAMB UTME</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <BookOpen className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">WAEC/NECO</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <Target className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Post-UTME</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <Award className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">JUPEB/IJMB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from curriculum design to student support.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student-Centered</h3>
              <p className="text-gray-600">
                Every decision we make is guided by what is best for our students&apos; learning journey.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate our teaching methods and technology to enhance learning outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of successful students who have achieved their academic goals with us.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
